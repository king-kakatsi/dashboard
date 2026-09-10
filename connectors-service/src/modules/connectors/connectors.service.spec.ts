import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { Connector } from './schemas/connector.schema';

describe('ConnectorsService', () => {
  let service: ConnectorsService;

  const saveMock = jest.fn();
  const modelMock: any = jest.fn().mockImplementation(() => ({
    save: saveMock,
  }));
  modelMock.find = jest.fn();
  modelMock.findById = jest.fn();
  modelMock.findByIdAndUpdate = jest.fn();
  modelMock.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectorsService,
        { provide: getModelToken(Connector.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<ConnectorsService>(ConnectorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a connector on success', async () => {
      saveMock.mockResolvedValue({ title: 'Github' });
      const result = await service.create({
        title: 'Github',
        icon: 'https://example.com/icon.png',
        baseUrl: 'https://api.github.com',
      } as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ title: 'Github' });
    });

    it('throws ConflictException on duplicate key', async () => {
      saveMock.mockRejectedValue({ code: 11000 });
      await expect(service.create({} as any)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      saveMock.mockRejectedValue(new Error('db down'));
      await expect(service.create({} as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('returns all connectors', async () => {
      modelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ title: 'A' }]),
      });
      await expect(service.findAll()).resolves.toEqual([{ title: 'A' }]);
    });
  });

  describe('findOne', () => {
    it('returns the connector when found', async () => {
      modelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ title: 'A' }),
      });
      await expect(service.findOne('id1')).resolves.toEqual({ title: 'A' });
    });

    it('throws NotFoundException when missing', async () => {
      modelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('returns the updated connector', async () => {
      modelMock.findByIdAndUpdate.mockResolvedValue({ title: 'B' });
      const result = await service.update('id1', { title: 'B' } as any);
      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when missing', async () => {
      modelMock.findByIdAndUpdate.mockResolvedValue(null);
      await expect(service.update('missing', {} as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('resolves when the connector exists', async () => {
      modelMock.findByIdAndDelete.mockResolvedValue({ title: 'A' });
      await expect(service.remove('id1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException when missing', async () => {
      modelMock.findByIdAndDelete.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('returns connectors activated by a user', async () => {
      modelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ title: 'A' }]),
      });
      await expect(service.findByUser('u1')).resolves.toEqual([{ title: 'A' }]);
      expect(modelMock.find).toHaveBeenCalledWith({
        userIds: { $in: ['u1'] },
      });
    });
  });

  describe('activateForUser', () => {
    it('adds the user once and saves', async () => {
      const doc = { userIds: [], save: jest.fn() };
      modelMock.findById.mockResolvedValue(doc);
      await service.activateForUser('c1', 'u1');
      expect(doc.userIds).toEqual(['u1']);
      expect(doc.save).toHaveBeenCalled();
    });

    it('is idempotent when the user is already active', async () => {
      const doc = { userIds: ['u1'], save: jest.fn() };
      modelMock.findById.mockResolvedValue(doc);
      await service.activateForUser('c1', 'u1');
      expect(doc.userIds).toEqual(['u1']);
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the connector is missing', async () => {
      modelMock.findById.mockResolvedValue(null);
      await expect(
        service.activateForUser('missing', 'u1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deactivateForUser', () => {
    it('removes the user and saves', async () => {
      const doc = { userIds: ['u1', 'u2'], save: jest.fn() };
      modelMock.findById.mockResolvedValue(doc);
      await service.deactivateForUser('c1', 'u1');
      expect(doc.userIds).toEqual(['u2']);
      expect(doc.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when the connector is missing', async () => {
      modelMock.findById.mockResolvedValue(null);
      await expect(
        service.deactivateForUser('missing', 'u1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
