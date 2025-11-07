import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Parser from 'rss-parser';
import type { Response } from 'express';

@Controller('proxy')
export class ProxyController {
  private parser: Parser;

  constructor(private configService: ConfigService) {
    this.parser = new Parser();
  }

  @Get()
  async proxy(
    @Query('baseUrl') baseUrl: string,
    @Query('endpoint') endpoint: string,
    @Res() res: Response,
  ) {
    try {
      const fullUrl = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
      const authServiceUrl =
        this.configService.get<string>('AUTH_SERVICE_URL') ||
        'http://localhost:3001';

      //Detect if the API requires authentication
      const requiresAuth =
        fullUrl.includes('gmail.googleapis.com') ||
        fullUrl.includes('drive.googleapis.com') ||
        fullUrl.includes('calendar.googleapis.com');

      let accessToken: string | null = null;

      // Only fetch OAuth token if needed
      if (requiresAuth) {
        try {
          const tokenResponse = await axios.get(
            `${authServiceUrl}/auth/oauth-token`,
            {
              withCredentials: true,
            },
          );
          accessToken = tokenResponse.data?.access_token || null;
        } catch {
          console.log('No token found for secure Google API.');
        }
      }

      //If Gmail and no token, redirect to Google Auth
      if (requiresAuth && !accessToken) {
        console.log('Redirecting to Google login for secure widget...');
        return res.redirect(`${authServiceUrl}/auth/google`);
      }

      //Google News
      if (fullUrl.includes('news.google.com')) {
        const feed = await this.parser.parseURL(fullUrl);

        const articles = feed.items.slice(0, 5).map((item) => ({
          title: item.title,
          link: item.link,
          source: item.creator || item.author || 'Unknown source',
        }));

        const html = `
          <html>
            <body style="font-family:Arial, sans-serif; padding:10px;">
              <h3>Latest News:</h3>
              <ul>
                ${articles
                  .map(
                    (a) => `
                  <li style="margin-bottom:10px;">
                    <a href="${a.link}" target="_blank">${a.title}</a>
                    <br><small>${a.source}</small>
                  </li>`,
                  )
                  .join('')}
              </ul>
            </body>
          </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      }
      //weather
      // if (fullUrl.includes('https://api.openweathermap.org')) {
      //   const feed = await this.parser.parseURL(fullUrl);

      //   const articles = feed.items.slice(0, 5).map((item) => ({
      //     title: item.title,
      //     link: item.link,
      //     source: item.creator || item.author || 'Unknown source',
      //   }));

      //   const html = `
      //     <html>
      //       <body style="font-family:Arial, sans-serif; padding:10px;">
      //         <h3>Latest News:</h3>
      //         <ul>
      //           ${articles
      //             .map(
      //               (a) => `
      //             <li style="margin-bottom:10px;">
      //               <a href="${a.link}" target="_blank">${a.title}</a>
      //               <br><small>${a.source}</small>
      //             </li>`,
      //             )
      //             .join('')}
      //         </ul>
      //       </body>
      //     </html>
      //   `;

      //   res.setHeader('Content-Type', 'text/html');
      //   return res.send(html);
      // }

      if (fullUrl.includes('https://api.openweathermap.org')) {
        try {
          const feed = await this.parser.parseURL(fullUrl);

          const articles = feed.items.slice(0, 5).map((item) => ({
            title: item.title,
            link: item.link,
            source: item.creator || item.author || 'Unknown source',
          }));

          const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Latest Weather Updates</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; }
            h3 { color: #333; }
            ul { list-style: none; padding: 0; }
            li { margin-bottom: 12px; }
            a { text-decoration: none; color: #007bff; }
            a:hover { text-decoration: underline; }
            small { color: #555; }
          </style>
        </head>
        <body>
          <h3>Latest Weather Updates:</h3>
          <ul>
            ${articles
              .map(
                (a) => `
              <li>
                <a href="${a.link}" target="_blank">${a.title}</a><br>
                <small>${a.source}</small>
              </li>
            `,
              )
              .join('')}
          </ul>
        </body>
      </html>
    `;

          res.setHeader('Content-Type', 'text/html');
          return res.send(html);
        } catch (error) {
          console.error('Error fetching feed:', error);
          res.status(500).send('<h1>Error loading weather feed</h1>');
        }
      }

      //Gmail (Requires authentication)
      if (fullUrl.includes('gmail.googleapis.com')) {
        const response = await axios.get(fullUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

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
            `<b>From:</b> ${from || 'Unknown'}<br><b>Subject:</b> ${subject || '(No subject)'}<br><small>${snippet}</small><hr>`,
          );
        }

        const html = `
          <html>
            <body style="font-family:Arial, sans-serif;">
              <h3>Recent Emails:</h3>
              ${details.join('')}
            </body>
          </html>
        `;
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      }

      // any other public API (no token)
      const response = await axios.get(fullUrl, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      return res.json(response.data);
    } catch (error: any) {
      console.error('Proxy error:', error.message);

      // If token expired or invalid → redirect to Google login
      if (error.response?.status === 401) {
        const authServiceUrl =
          this.configService.get<string>('AUTH_SERVICE_URL') ||
          'http://localhost:3001';
        return res.redirect(`${authServiceUrl}/auth/google`);
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
      const redirectUri =
        this.configService.get('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/proxy/callback';

      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
      );

      const accessToken = tokenResponse.data.access_token;
      console.log('Google access token received:', !!accessToken);

      const frontendUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      return res.redirect(frontendUrl);
    } catch (error: any) {
      console.error('Error during Google callback:', error.message);
      return res.send('Authentication failed.');
    }
  }
}
