import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { Widget } from './schemas/widgets.schema';

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
