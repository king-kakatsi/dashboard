import { Test, TestingModule } from '@nestjs/testing';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';

describe('WidgetsController', () => {
  let controller: WidgetsController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findByService: jest.fn(),
      findOne: jest.fn(),
      fetchWidgetData: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateUserPosition: jest.fn(),
      activateForUser: jest.fn(),
      deactivateForUser: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetsController],
      providers: [{ provide: WidgetsService, useValue: service }],
    }).compile();

    controller = module.get<WidgetsController>(WidgetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a widget', async () => {
    service.create.mockResolvedValue({ name: 'Weather' });
    await expect(
      controller.create({ name: 'Weather' } as any),
    ).resolves.toEqual({
      name: 'Weather',
    });
  });

  it('lists all widgets', async () => {
    service.findAll.mockResolvedValue([{ name: 'Weather' }]);
    await expect(controller.findAll()).resolves.toEqual([{ name: 'Weather' }]);
  });

  it('fetches live widget data', async () => {
    service.fetchWidgetData.mockResolvedValue({ success: true });
    await expect(controller.fetchWidgetData('w1', {})).resolves.toEqual({
      success: true,
    });
    expect(service.fetchWidgetData).toHaveBeenCalledWith('w1', {});
  });

  it('finds widgets by user', async () => {
    service.findByUser.mockResolvedValue([{ name: 'Weather' }]);
    await expect(controller.findByUser('u1')).resolves.toEqual([
      { name: 'Weather' },
    ]);
  });

  it('finds widgets by service', async () => {
    service.findByService.mockResolvedValue([{ name: 'Weather' }]);
    await expect(controller.findByService('c1')).resolves.toEqual([
      { name: 'Weather' },
    ]);
  });

  it('finds one widget', async () => {
    service.findOne.mockResolvedValue({ name: 'Weather' });
    await expect(controller.findOne('w1')).resolves.toEqual({
      name: 'Weather',
    });
  });

  it('updates a widget', async () => {
    service.update.mockResolvedValue({ name: 'Updated' });
    await expect(
      controller.update('w1', { name: 'Updated' } as any),
    ).resolves.toEqual({
      name: 'Updated',
    });
    expect(service.update).toHaveBeenCalledWith('w1', { name: 'Updated' });
  });

  it('removes a widget', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove('w1')).resolves.toBeUndefined();
  });

  it('updates a user position', async () => {
    service.updateUserPosition.mockResolvedValue({ name: 'Weather' });
    await expect(
      controller.updatePosition('w1', 'u1', { x: 1, y: 2 }),
    ).resolves.toEqual({ name: 'Weather' });
  });

  it('activates and deactivates a widget for a user', async () => {
    service.activateForUser.mockResolvedValue({ userIds: ['u1'] });
    await expect(controller.activateForUser('w1', 'u1')).resolves.toEqual({
      userIds: ['u1'],
    });
    service.deactivateForUser.mockResolvedValue({ userIds: [] });
    await expect(controller.deactivateForUser('w1', 'u1')).resolves.toEqual({
      userIds: [],
    });
  });
});
