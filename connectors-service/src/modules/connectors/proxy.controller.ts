import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { Request, Response } from 'express';

@Controller('proxy')
export class ProxyController {
    private userTokens = new Map<string, string>(); // temp storage

    constructor(private configService: ConfigService) { }

    @Get()
    async proxy(
        @Query('baseUrl') baseUrl: string,
        @Query('endpoint') endpoint: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const authServiceUrl =
                this.configService.get<string>('AUTH_SERVICE_URL') ||
                'http://localhost:3001';

            const cookieHeader = req.headers.cookie; // get client cookie

            // send cookie to google auth
            const tokenResponse = await axios.get(`${authServiceUrl}/auth/oauth-token`, {
                headers: { Cookie: cookieHeader || '' },
                withCredentials: true,
            });

            const accessToken = tokenResponse.data?.access_token;
            if (!accessToken) {
                console.log('No Google token, need user auth');
                const redirectUrl = `${authServiceUrl}/auth/google`;
                return res.json({ redirect: redirectUrl });
            }

            // target url
            const fullUrl = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

            const response = await axios.get(fullUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // if Gmail format in html
            if (fullUrl.includes('gmail.googleapis.com')) {
                const messages = response.data.messages || [];
                const details: string[] = [];

                for (const msg of messages.slice(0, 5)) {
                    const msgDetail = await axios.get(
                        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        },
                    );

                    const headers = msgDetail.data.payload.headers;
                    const from = headers.find((h: any) => h.name === 'From')?.value;
                    const subject = headers.find((h: any) => h.name === 'Subject')?.value;
                    const snippet = msgDetail.data.snippet;

                    details.push(
                        `<b>De :</b> ${from || 'Unknown'}<br><b>Objet :</b> ${subject || '(No subject)'
                        }<br><small>${snippet}</small><hr>`,
                    );
                }

                const html = `
          <html>
            <body style="font-family:Arial, sans-serif;">
              <h3>Last mails :</h3>
              ${details.join('')}
            </body>
          </html>
        `;
                res.setHeader('Content-Type', 'text/html');
                return res.send(html);
            }

            return res.json(response.data);
        } catch (error: any) {
            console.error('Proxy error:', error.message);

            if (error.response?.status === 401) {
                const authServiceUrl =
                    this.configService.get<string>('AUTH_SERVICE_URL') ||
                    'http://localhost:3001';
                return res.json({ redirect: `${authServiceUrl}/auth/google` });
            }

            return res.status(500).json({
                error: 'Failed to fetch from external API',
                details: error.message,
            });
        }
    }

    @Get('callback')
    async googleCallback(@Query('code') code: string, @Res() res: Response) {
        try {
            const clientId = this.configService.get('GOOGLE_CLIENT_ID');
            const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
            const redirectUri = 'http://localhost:3000/proxy/callback';

            // exchange code with token
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            });

            const accessToken = tokenResponse.data.access_token;
            this.userTokens.set('demo-user', accessToken);

            console.log('Token received.');

            // Redirect to client side
            const frontendUrl =
                this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
            return res.redirect(frontendUrl);
        } catch (error: any) {
            console.error('Error during Google callback:', error.message);
            return res.send('Authentication failed.');
        }
    }
}
