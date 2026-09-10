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
});
