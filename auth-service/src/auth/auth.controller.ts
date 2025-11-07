import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Res,
  Req,
  Param,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CustomAuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profile'))
  async register(
    @Body() data: RegisterDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (file) {
        const isValid = this.authService.checkFile(file);
        if (!isValid) {
          return res.status(400).json({ message: 'Invalid file type' });
        }

        const imageUrl = await this.authService.uploadImage(file, 'profiles');
        data.image = imageUrl;
      }

      const result = await this.authService.register(data);

      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || 'Registration failed',
      });
    }
  }

  @Post('login')
  async login(@Body() data: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(data);

      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({
        message: error.message || 'Login failed',
      });
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport handles this
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const token = this.authService.generateJwtToken(user);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}&id=${user?.id}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Passport handles this
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const token = this.authService.generateJwtToken(user);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // console.log('\n\n\n\nDEBUG oAuth token =====================', token);
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}&id=${user?.id}`);
  }

  @Get('me')
  @UseGuards(CustomAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Get('oauth-token')
  @UseGuards(CustomAuthGuard)
  async getOAuthToken(@CurrentUser() user: any) {
    const token = await this.authService.getOAuthToken(user.id);
    return { access_token: token };
  }

  @Post('logout')
  @UseGuards(CustomAuthGuard)
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  @Post('verify-email/:id')
  async sendVerificationEmail(@Param('id') id: string) {
    await this.authService.sendMail(id);
    return { message: 'Verification email sent' };
  }

  @Get('confirm-email/:id')
  async confirmEmail(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.authService.confirmMail(id);
      const frontendUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/email-confirmed`);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }


  
  @Put('change-password')
  @UseGuards(CustomAuthGuard)
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    console.log("==========================", user);
    return this.authService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}
