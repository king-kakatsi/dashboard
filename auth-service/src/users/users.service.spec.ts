import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, NotFoundException } from '@nestjs/common';
import prisma from '../../lib/prisma';
import { UsersService } from './users.service';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrismaUser = (prisma as any).user;

function storedUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'u1',
    email: 'user@test',
    username: 'tester',
    password: 'hashed',
    accessToken: null,
    refreshToken: null,
    connectedServiceIds: [],
    activeWidgetIds: [],
    standByEmail: null,
    standByUsername: null,
    ...overrides,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let mailService: { sendMail: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    mailService = { sendMail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: MailerService, useValue: mailService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById / findByEmail / findAll', () => {
    it('returns a user without sensitive fields', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(storedUser());
      const found = await service.findById('u1');
      expect(found).not.toHaveProperty('password');
      expect(found).not.toHaveProperty('accessToken');
      expect(found).toHaveProperty('id', 'u1');
    });

    it('throws NotFoundException for an unknown id', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('finds by email without filtering', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(storedUser());
      await expect(service.findByEmail('user@test')).resolves.toHaveProperty(
        'id',
        'u1',
      );
    });

    it('lists users newest first without passwords', async () => {
      mockPrismaUser.findMany.mockResolvedValue([
        storedUser(),
        storedUser({ id: 'u2' }),
      ]);
      const users = await service.findAll();
      expect(users).toHaveLength(2);
      expect(users[0]).not.toHaveProperty('password');
      expect(mockPrismaUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  describe('update', () => {
    it('rejects an unknown user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(
        service.update('missing', { username: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('applies direct field updates', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(storedUser());
      mockPrismaUser.update.mockResolvedValue(storedUser({ username: 'new' }));
      const updated = await service.update('u1', { username: 'new' });
      expect(updated).toHaveProperty('username', 'new');
    });

    it('stages a new email and sends a confirmation link', async () => {
      mockPrismaUser.findUnique
        .mockResolvedValueOnce(storedUser())
        .mockResolvedValueOnce(null);
      mockPrismaUser.update.mockResolvedValue({});
      mailService.sendMail.mockResolvedValue({});

      const result = await service.update('u1', {
        standByEmail: 'new@test',
      });

      expect(result.message).toMatch(/confirmation email/i);
      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { standByEmail: 'new@test' } }),
      );
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test',
          html: expect.stringContaining('/confirm-update/u1'),
        }),
      );
    });

    it('rejects a staged email already in use', async () => {
      mockPrismaUser.findUnique
        .mockResolvedValueOnce(storedUser())
        .mockResolvedValueOnce(storedUser({ id: 'u2' }));
      await expect(
        service.update('u1', { standByEmail: 'taken@test' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('confirmUpdate', () => {
    it('commits staged email and username', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(
        storedUser({ standByEmail: 'new@test', standByUsername: 'newname' }),
      );
      mockPrismaUser.update.mockResolvedValue(storedUser());
      const result = await service.confirmUpdate('u1');
      expect(mockPrismaUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            email: 'new@test',
            standByEmail: null,
            username: 'newname',
            standByUsername: null,
          },
        }),
      );
      expect(result).toHaveProperty('message');
    });

    it('rejects when nothing is pending', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(storedUser());
      await expect(service.confirmUpdate('u1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects an unknown user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);
      await expect(service.confirmUpdate('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes and confirms', async () => {
      mockPrismaUser.delete.mockResolvedValue(storedUser());
      await expect(service.delete('u1')).resolves.toHaveProperty('message');
    });
  });

  describe('connected services and widgets', () => {
    it('adds a service once and skips duplicates', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(storedUser());
      mockPrismaUser.update.mockImplementation(({ data }) => ({
        ...storedUser(),
        ...data,
      }));

      const added = await service.addConnectedService('u1', 'github');
      expect(added).toHaveProperty('connectedServiceIds', ['github']);

      mockPrismaUser.findUnique.mockResolvedValue(
        storedUser({ connectedServiceIds: ['github'] }),
      );
      const unchanged = await service.addConnectedService('u1', 'github');
      expect(unchanged).toHaveProperty('connectedServiceIds', ['github']);
      expect(mockPrismaUser.update).toHaveBeenCalledTimes(1);
    });

    it('removes a connected service', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(
        storedUser({ connectedServiceIds: ['github', 'gmail'] }),
      );
      mockPrismaUser.update.mockImplementation(({ data }) => ({
        ...storedUser(),
        ...data,
      }));
      const updated = await service.removeConnectedService('u1', 'gmail');
      expect(updated).toHaveProperty('connectedServiceIds', ['github']);
    });

    it('adds a widget once and skips duplicates', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(storedUser());
      mockPrismaUser.update.mockImplementation(({ data }) => ({
        ...storedUser(),
        ...data,
      }));

      const added = await service.addActiveWidget('u1', 'w1');
      expect(added).toHaveProperty('activeWidgetIds', ['w1']);

      mockPrismaUser.findUnique.mockResolvedValue(
        storedUser({ activeWidgetIds: ['w1'] }),
      );
      const unchanged = await service.addActiveWidget('u1', 'w1');
      expect(unchanged).toHaveProperty('activeWidgetIds', ['w1']);
    });

    it('removes an active widget', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(
        storedUser({ activeWidgetIds: ['w1', 'w2'] }),
      );
      mockPrismaUser.update.mockImplementation(({ data }) => ({
        ...storedUser(),
        ...data,
      }));
      const updated = await service.removeActiveWidget('u1', 'w1');
      expect(updated).toHaveProperty('activeWidgetIds', ['w2']);
    });
  });
});
