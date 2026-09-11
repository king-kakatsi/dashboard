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
  // AES-256 needs exactly 32 bytes: longer keys are cut, shorter ones fail.
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

  /**
   * Creates a local account and logs it in immediately.
   *
   * Rejects taken emails, hashes the password with bcrypt, stores the user,
   * sends the verification email, then returns a token with the user minus
   * secrets. The account works before verification; some features wait for it.
   *
   * @param data Validated registration payload
   * @returns Token plus sanitized user
   * @throws {ConflictException} When the email is already registered
   * @throws {BadRequestException} When the two passwords differ
   */
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

  /**
   * Logs in with email and password.
   *
   * Every failure answers the same message on purpose: distinct messages
   * would let attackers guess which emails exist.
   *
   * @param data Validated login payload
   * @returns Token plus sanitized user
   * @throws {UnauthorizedException} When credentials are wrong or OAuth-only
   */
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

  /**
   * Links a Google or GitHub profile to an account.
   *
   * First visit creates a verified user with encrypted provider tokens.
   * Returning visits only refresh the tokens and picture. An email already
   * taken by another provider is rejected so accounts cannot be hijacked.
   *
   * @param profile Passport profile merged with access and refresh tokens
   * @param provider OAuth provider name, like 'google' or 'github'
   * @returns The linked user, with tokens still encrypted
   * @throws {BadRequestException} When the provider hides the email
   * @throws {ConflictException} When the email belongs to another provider
   */
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

  /**
   * Decrypts the stored provider token for third-party calls.
   *
   * @param userId Owner of the token
   * @returns The plain token, or null when the user never linked OAuth
   */
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

  /**
   * Turns a JWT into the session user for guards.
   *
   * Any failure (bad signature, expired token, deleted user) becomes the
   * same error, so callers learn nothing about which check failed. Only
   * the fields guards need are loaded, never secrets.
   *
   * @param token Raw JWT from header or cookie
   * @throws {UnauthorizedException} When the token is invalid or expired
   */
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

  /**
   * Replaces the password after checking the current one.
   *
   * OAuth users have no local password, so the check fails for them: they
   * keep signing in through their provider instead.
   *
   * @throws {NotFoundException} When the user does not exist
   * @throws {BadRequestException} When the current password is wrong
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
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
      from:
        this.configService.get('MAIL_FROM') ||
        this.configService.get('MAIL_USER'),
      to: user.email,
      subject: 'Verify Your Email - Dashboard',
      html: htmlContent,
    });
  }

  async confirmMail(id: string) {
    return this.userService.update(id, { verified: true });
  }

  /**
   * Streams an upload buffer to Cloudinary and returns its URL.
   *
   * The callback API is wrapped in a promise that rejects on upload errors
   * and on empty results, so callers only ever get a usable URL or a throw.
   */
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

  /**
   * Enforces the avatar rules: an image under 5MB.
   *
   * This runs after the Multer size cap on purpose: two independent checks
   * mean one misconfigured layer cannot let huge files through.
   *
   * @throws {BadRequestException} When the file is missing, not an image, or too big
   */
  checkFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
    // Second check after the upload filter: never trust one guard alone.
    const maxImageBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxImageBytes) {
      throw new BadRequestException('Image must be smaller than 5MB');
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
