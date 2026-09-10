import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { WidgetsService } from './widgets.service';
import { Widget } from './schemas/widgets.schema';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('WidgetsService', () => {
  let service: WidgetsService;

  const saveMock = jest.fn();
  const modelMock: any = jest.fn().mockImplementation(() => ({
    save: saveMock,
  }));
  modelMock.find = jest.fn();
  modelMock.findById = jest.fn();
  modelMock.findByIdAndUpdate = jest.fn();
  modelMock.findByIdAndDelete = jest.fn();

  function mockFindByIdWithPopulate(resolved: any) {
    modelMock.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(resolved),
      }),
    });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetsService,
        { provide: getModelToken(Widget.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get<WidgetsService>(WidgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('saves and returns the widget', async () => {
      saveMock.mockResolvedValue({ name: 'Weather' });
      await expect(service.create({ name: 'Weather' } as any)).resolves.toEqual(
        { name: 'Weather' },
      );
    });
  });

  describe('findOne', () => {
    it('returns the widget when found', async () => {
      mockFindByIdWithPopulate({ name: 'Weather' });
      await expect(service.findOne('w1')).resolves.toEqual({ name: 'Weather' });
    });

    it('throws NotFoundException when missing', async () => {
      mockFindByIdWithPopulate(null);
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('returns the updated widget', async () => {
      modelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Updated' }),
      });
      await expect(
        service.update('w1', { name: 'Updated' } as any),
      ).resolves.toEqual({
        name: 'Updated',
      });
    });

    it('throws NotFoundException when missing', async () => {
      modelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.update('missing', {} as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('resolves when the widget exists', async () => {
      modelMock.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Weather' }),
      });
      await expect(service.remove('w1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException when missing', async () => {
      modelMock.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findAll / findByUser / findByService', () => {
    it('returns all widgets with populated service', async () => {
      modelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ name: 'Weather' }]),
        }),
      });
      await expect(service.findAll()).resolves.toEqual([{ name: 'Weather' }]);
    });

    it('returns widgets of a user', async () => {
      modelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ name: 'Weather' }]),
        }),
      });
      await expect(service.findByUser('u1')).resolves.toEqual([
        { name: 'Weather' },
      ]);
      expect(modelMock.find).toHaveBeenCalledWith({
        userIds: { $in: ['u1'] },
      });
    });

    it('returns widgets of a service', async () => {
      modelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ name: 'Weather' }]),
      });
      await expect(service.findByService('c1')).resolves.toEqual([
        { name: 'Weather' },
      ]);
      expect(modelMock.find).toHaveBeenCalledWith({ serviceId: 'c1' });
    });
  });

  describe('updateUserPosition', () => {
    it('moves an existing user position', async () => {
      const stored = {
        user_id: { toString: () => 'u1' },
        position: { x: 0, y: 0 },
      };
      const storedWidget = {
        positions: [stored],
        save: jest.fn(),
      };
      modelMock.findById.mockResolvedValue(storedWidget);
      await service.updateUserPosition('w1', 'u1', { x: 5, y: 6 });
      expect(stored.position).toEqual({ x: 5, y: 6 });
      expect(storedWidget.save).toHaveBeenCalled();
    });

    it('adds a position for a new user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const storedWidget = { positions: [], save: jest.fn() };
      modelMock.findById.mockResolvedValue(storedWidget);
      await service.updateUserPosition('w1', userId, { x: 1, y: 2 });
      expect(storedWidget.positions).toHaveLength(1);
      expect(storedWidget.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when the widget is missing', async () => {
      modelMock.findById.mockResolvedValue(null);
      await expect(
        service.updateUserPosition('missing', 'u1', { x: 0, y: 0 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('fetchWidgetData', () => {
    it('throws NotFoundException when the widget is missing', async () => {
      mockFindByIdWithPopulate(null);
      await expect(service.fetchWidgetData('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the connector is invalid', async () => {
      mockFindByIdWithPopulate({ name: 'Broken', serviceId: null });
      await expect(service.fetchWidgetData('w1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns live data on success', async () => {
      mockFindByIdWithPopulate({
        _id: 'w1',
        name: 'Weather',
        endpoint: '/data',
        serviceId: { baseUrl: 'https://api.example.com' },
      });
      axiosMock.get.mockResolvedValue({ status: 200, data: { temp: 21 } });
      const result = await service.fetchWidgetData('w1', { q: 'paris' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ temp: 21 });
      expect(axiosMock.get).toHaveBeenCalledWith(
        'https://api.example.com/data?q=paris',
        expect.anything(),
      );
    });

    it('throws InternalServerErrorException when the network fails', async () => {
      mockFindByIdWithPopulate({
        _id: 'w1',
        name: 'Weather',
        endpoint: '/data',
        serviceId: { baseUrl: 'https://api.example.com' },
      });
      axiosMock.get.mockRejectedValue(new Error('timeout'));
      await expect(service.fetchWidgetData('w1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException on non-200 status', async () => {
      mockFindByIdWithPopulate({
        _id: 'w1',
        name: 'Weather',
        endpoint: '/data',
        serviceId: { baseUrl: 'https://api.example.com' },
      });
      axiosMock.get.mockResolvedValue({ status: 500, data: null });
      await expect(service.fetchWidgetData('w1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('activateForUser / deactivateForUser', () => {
    it('adds the user once', async () => {
      const doc = { userIds: [], save: jest.fn() };
      modelMock.findById.mockResolvedValue(doc);
      await service.activateForUser('w1', 'u1');
      expect(doc.userIds).toEqual(['u1']);
    });

    it('removes the user', async () => {
      const doc = { userIds: ['u1'], save: jest.fn() };
      modelMock.findById.mockResolvedValue(doc);
      await service.deactivateForUser('w1', 'u1');
      expect(doc.userIds).toEqual([]);
    });

    it('throws NotFoundException when the widget is missing', async () => {
      modelMock.findById.mockResolvedValue(null);
      await expect(
        service.activateForUser('missing', 'u1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
