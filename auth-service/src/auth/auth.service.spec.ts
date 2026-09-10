import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../../lib/prisma';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('cloudinary', () => ({
  v2: { uploader: { upload_stream: jest.fn() } },
}));

const mockPrismaUser = (prisma as any).user;
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const uploadStreamMock = cloudinary.uploader.upload_stream as jest.Mock;

const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef';

function mockConfig(extra: Record<string, string> = {}) {
  const values: Record<string, string> = {
    ENCRYPTION_KEY,
    FRONTEND_URL: 'http://frontend.test',
    MAIL_FROM: 'sender@test',
    MAIL_USER: 'sender@test',
    ...extra,
  };
  return { get: jest.fn((key: string) => values[key]) };
}

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let mailService: { sendMail: jest.Mock };
  let usersService: { update: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    jwtService = { sign: jest.fn(), verify: jest.fn() };
    mailService = { sendMail: jest.fn() };
    usersService = { update: jest.fn() };
    configService = mockConfig();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: MailerService, useValue: mailService },
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const payload = {
      email: 'user@test',
      username: 'tester',
      password: 'Strong1!',
      passwordConfirmation: 'Strong1!',
    };

    it('creates a verified-mail user and returns a token', async () => {
      mockPrismaUser.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue({
          id: 'u1',
          email: payload.email,
          username: payload.username,
        });
      bcryptMock.hash.mockResolvedValue('hashed');
      mockPrismaUser.create.mockResolvedValue({ id: 'u1', ...payload });
      mailService.sendMail.mockResolvedValue({});
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(payload as any);

      expect(mockPrismaUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: payload.email,
            password: 'hashed',
          }),
        }),
      );
      expect(mailService.sendMail).toHaveBeenCalled();
      expect(result.access_token).toBe('jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('rejects an existing email', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(service.register(payload as any)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rejects mismatched passwords', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(
        service.register({
          ...payload,
          passwordConfirmation: 'Other1!',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test',
        provider: 'LOCAL',
        password: 'hashed',
      });
      bcryptMock.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'user@test',
        password: 'Strong1!',
      });

      expect(result.access_token).toBe('jwt-token');
    });

    it.each([
      ['missing user', null],
      ['oauth user', { id: 'u1', provider: 'GOOGLE' }],
      ['passwordless user', { id: 'u1', provider: 'LOCAL' }],
    ])('rejects invalid credentials (%s)', async (_label, user) => {
      mockPrismaUser.findUnique.mockResolvedValue(user);
      await expect(
        service.login({ email: 'user@test', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'u1',
        provider: 'LOCAL',
        password: 'hashed',
      });
      bcryptMock.compare.mockResolvedValue(false);
      await expect(
        service.login({ email: 'user@test', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('validateOAuthUser', () => {
    it('rejects a profile without email', async () => {
      await expect(
        service.validateOAuthUser({}, 'google'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a first-time OAuth user with encrypted tokens', async () => {
      mockPrismaUser.findFirst.mockResolvedValue(null);
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockImplementation(({ data }) => ({
        id: 'new-id',
        ...data,
      }));

      const profile = {
        id: 'google-1',
        displayName: 'G User',
        emails: [{ value: 'g@test' }],
        photos: [{ value: 'https://img' }],
        accessToken: 'oauth-access',
        refreshToken: 'oauth-refresh',
      };
      const created = await service.validateOAuthUser(profile, 'google');

      expect(created.verified).toBe(true);
      expect(created.accessToken).toContain(':');

      const stored = mockPrismaUser.create.mock.calls[0][0].data;
      expect(stored.accessToken).not.toBe('oauth-access');
    });

    it('rejects an email already registered with another provider', async () => {
      mockPrismaUser.findFirst.mockResolvedValue(null);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'u1',
        provider: 'LOCAL',
      });
      await expect(
        service.validateOAuthUser(
          { id: 'g2', emails: [{ value: 'taken@test' }] },
          'google',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('refreshes tokens of a returning user', async () => {
      mockPrismaUser.findFirst.mockResolvedValue({
        id: 'u1',
        image: 'old',
      });
      mockPrismaUser.update.mockImplementation(({ data }) => ({
        id: 'u1',
        ...data,
      }));
      const updated = await service.validateOAuthUser(
        {
          id: 'g1',
          emails: [{ value: 'g@test' }],
          accessToken: 'new-access',
        },
        'google',
      );
      expect(updated.accessToken).toContain(':');
    });
  });

  describe('getOAuthToken', () => {
    it('decrypts the stored token', async () => {
      mockPrismaUser.findFirst.mockResolvedValue(null);
      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockImplementation(({ data }) => data);
      await service.validateOAuthUser(
        {
          id: 'g1',
          emails: [{ value: 'g@test' }],
          accessToken: 'plain-token',
        },
        'google',
      );
      const stored = mockPrismaUser.create.mock.calls[0][0].data;

      mockPrismaUser.findUnique.mockResolvedValue({
        accessToken: stored.accessToken,
      });
      await expect(service.getOAuthToken('u1')).resolves.toBe('plain-token');
    });

    it('returns null when no token is stored', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({ accessToken: null });
      await expect(service.getOAuthToken('u1')).resolves.toBeNull();
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.getOAuthToken('missing')).resolves.toBeNull();
    });
  });

  describe('generateJwtToken / verifyToken', () => {
    it('signs the expected payload', () => {
      jwtService.sign.mockReturnValue('jwt-token');
      const token = service.generateJwtToken({
        id: 'u1',
        email: 'user@test',
        role: 'USER',
        provider: 'LOCAL',
      });
      expect(token).toBe('jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1' }),
      );
    });

    it('returns the user for a valid token', async () => {
      jwtService.verify.mockReturnValue({ userId: 'u1' });
      mockPrismaUser.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(service.verifyToken('good')).resolves.toEqual({ id: 'u1' });
    });

    it('rejects an invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('bad signature');
      });
      await expect(service.verifyToken('bad')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a token for an unknown user', async () => {
      jwtService.verify.mockReturnValue({ userId: 'ghost' });
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.verifyToken('ghost')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('hashes and stores the new password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'u1',
        password: 'old-hashed',
      });
      bcryptMock.compare.mockResolvedValue(true);
      bcryptMock.hash.mockResolvedValue('new-hashed');
      mockPrismaUser.update.mockResolvedValue({});

      const result = await service.changePassword('u1', 'old', 'New1!pass');
      expect(result).toHaveProperty('message');
      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { password: 'new-hashed' } }),
      );
    });

    it('rejects an unknown user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(
        service.changePassword('missing', 'old', 'New1!pass'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a wrong current password', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'u1',
        password: 'old-hashed',
      });
      bcryptMock.compare.mockResolvedValue(false);
      await expect(
        service.changePassword('u1', 'wrong', 'New1!pass'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('sendMail / confirmMail', () => {
    it('sends a verification email with a frontend link', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test',
        username: 'tester',
      });
      mailService.sendMail.mockResolvedValue({});

      await service.sendMail('u1');

      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test',
          html: expect.stringContaining('/auth/confirm-email/u1'),
        }),
      );
    });

    it('rejects an unknown user id', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.sendMail('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('delegates confirmation to the users service', async () => {
      usersService.update.mockResolvedValue({ verified: true });
      await service.confirmMail('u1');
      expect(usersService.update).toHaveBeenCalledWith('u1', {
        verified: true,
      });
    });
  });

  describe('uploadImage / checkFile', () => {
    it('resolves with the uploaded URL', async () => {
      uploadStreamMock.mockImplementation((_options: any, done: any) => ({
        end: () => done(null, { secure_url: 'https://img/1.png' }),
      }));
      await expect(
        service.uploadImage({ buffer: Buffer.from('x') } as any, 'profiles'),
      ).resolves.toBe('https://img/1.png');
    });

    it('rejects when the upload fails', async () => {
      uploadStreamMock.mockImplementation((_options: any, done: any) => ({
        end: () => done(new Error('cloud down'), null),
      }));
      await expect(
        service.uploadImage({ buffer: Buffer.from('x') } as any),
      ).rejects.toThrow('cloud down');
    });

    it('accepts a small image', () => {
      expect(
        service.checkFile({
          mimetype: 'image/png',
          size: 1024,
        } as any),
      ).toBe(true);
    });

    it.each([
      ['missing file', undefined],
      ['non-image type', { mimetype: 'application/pdf', size: 10 }],
      ['oversized image', { mimetype: 'image/png', size: 6 * 1024 * 1024 }],
    ])('rejects %s', (_label, file) => {
      expect(() => service.checkFile(file as any)).toThrow(BadRequestException);
    });
  });
});
