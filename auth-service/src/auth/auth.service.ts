import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import prisma from '../../lib/prisma';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';
import { v2 as cloudinary } from 'cloudinary';
import { AuthProvider } from '@prisma/client';
import { EmailTemplateUtil } from 'src/common/utils/emailTemplate.utils';

@Injectable()
export class AuthService {
  private readonly encryptionKey: Buffer;

  constructor(
    private jwtService: JwtService,
    private readonly mailService: MailerService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const key =
      this.configService.get('ENCRYPTION_KEY') ||
      'default-key-change-in-production';
    this.encryptionKey = Buffer.from(key, 'utf-8').slice(0, 32);
  }

  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (data.password !== data.passwordConfirmation) {
      throw new BadRequestException("Passwords don't match");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        image: data.image || null,
        provider: AuthProvider.LOCAL,
      },
    });

    await this.sendMail(user.id);

    const token = this.generateJwtToken(user);

    return {
      access_token: token,
      user: this.sanitizeUser(user),
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || user.provider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateJwtToken(user);

    return {
      access_token: token,
      user: this.sanitizeUser(user),
    };
  }

  async validateOAuthUser(profile: any, provider: string) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new BadRequestException('Email not provided by OAuth provider');
    }

    const authProvider =
      AuthProvider[provider.toUpperCase() as keyof typeof AuthProvider];

    let user = await prisma.user.findFirst({
      where: {
        provider: authProvider,
        providerId: profile.id,
      },
    });

    if (!user) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException(
          `Email already registered with ${existingUser.provider} provider`,
        );
      }

      user = await prisma.user.create({
        data: {
          email,
          username: profile.displayName || email.split('@')[0],
          image: profile.photos?.[0]?.value,
          provider: authProvider,
          providerId: profile.id,
          verified: true,
          accessToken: profile.accessToken
            ? this.encrypt(profile.accessToken)
            : null,
          refreshToken: profile.refreshToken
            ? this.encrypt(profile.refreshToken)
            : null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: profile.accessToken
            ? this.encrypt(profile.accessToken)
            : undefined,
          refreshToken: profile.refreshToken
            ? this.encrypt(profile.refreshToken)
            : undefined,
          image: profile.photos?.[0]?.value || user.image,
        },
      });
    }

    return user;
  }

  async getOAuthToken(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });

    if (!user?.accessToken) {
      return null;
    }

    return this.decrypt(user.accessToken);
  }

  generateJwtToken(user: any): string {
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      provider: user.provider,
    });
  }

  async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          image: true,
          provider: true,
          verified: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async sendMail(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const verificationLink = `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/auth/confirm-email/${user.id}`;

    const htmlContent = EmailTemplateUtil.getVerificationEmail(
      user.username,
      verificationLink,
    );

    return this.mailService.sendMail({
      from: 'dashboard <noreply@dashboard.com>',
      to: user.email,
      subject: 'Verify Your Email - Dashboard',
      html: htmlContent,
    });
  }
    // const message = `
    //   <!DOCTYPE html>
    //   <html>
    //     <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    //       <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    //         <tr>
    //           <td align="center">
    //             <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    //               <tr>
    //                 <td style="background-color: #FF214F; padding: 40px 20px; text-align: center;">
    //                   <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Widget Platform</h1>
    //                 </td>
    //               </tr>
    //               <tr>
    //                 <td style="padding: 40px 30px; text-align: center;">
    //                   <h2 style="color: #333333; margin: 0 0 20px 0;">Welcome!</h2>
    //                   <p style="color: #666666; font-size: 16px; margin: 0 0 30px 0;">
    //                     Hi <strong style="color: #FF214F;">${user.username}</strong>, please verify your email to get started.
    //                   </p>
    //                   <a href="${verificationLink}" 
    //                      style="display: inline-block; padding: 16px 40px; background-color: #FF214F; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
    //                     Verify Email
    //                   </a>
    //                 </td>
    //               </tr>
    //             </table>
    //           </td>
    //         </tr>
    //       </table>
    //     </body>
    //   </html>
    // `;

    // return this.mailService.sendMail({
    //   from: 'Widget Platform <noreply@widgetplatform.com>',
    //   to: user.email,
    //   subject: 'Account Verification',
    //   html: message,
    // });
  }

  async confirmMail(id: string) {
    return this.userService.update(id, { verified: true });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'widget_platform',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result.secure_url);
          },
        )
        .end(file.buffer);
    });
  }

  checkFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
    return true;
  }

  private sanitizeUser(user: any) {
    const { password, accessToken, refreshToken, ...sanitized } = user;
    return sanitized;
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.encryptionKey,
      iv,
    );
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
