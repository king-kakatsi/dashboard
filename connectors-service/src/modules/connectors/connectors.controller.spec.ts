import { Test, TestingModule } from '@nestjs/testing';
import { ConnectorsController } from './connectors.controller';
import { ConnectorsService } from './connectors.service';

describe('ConnectorsController', () => {
  let controller: ConnectorsController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByUser: jest.fn(),
      activateForUser: jest.fn(),
      deactivateForUser: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectorsController],
      providers: [{ provide: ConnectorsService, useValue: service }],
    }).compile();

    controller = module.get<ConnectorsController>(ConnectorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a connector', async () => {
    service.create.mockResolvedValue({ success: true });
    await expect(controller.create({ title: 'A' } as any)).resolves.toEqual({
      success: true,
    });
    expect(service.create).toHaveBeenCalledWith({ title: 'A' });
  });

  it('lists all connectors', async () => {
    service.findAll.mockResolvedValue([{ title: 'A' }]);
    await expect(controller.findAll()).resolves.toEqual([{ title: 'A' }]);
  });

  it('activates a connector for a user', async () => {
    service.activateForUser.mockResolvedValue({ userIds: ['u1'] });
    await expect(controller.activateForUser('c1', 'u1')).resolves.toEqual({
      userIds: ['u1'],
    });
  });

  it('updates a connector', async () => {
    service.update.mockResolvedValue({ success: true });
    await expect(
      controller.update('c1', { title: 'B' } as any),
    ).resolves.toEqual({
      success: true,
    });
  });

  it('removes a connector', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove('c1')).resolves.toEqual({
      message: 'Connector deleted successfully',
    });
  });

  it('finds connectors by user and deactivates', async () => {
    service.findByUser.mockResolvedValue([{ title: 'A' }]);
    await expect(controller.findByUser('u1')).resolves.toEqual([
      { title: 'A' },
    ]);
    service.deactivateForUser.mockResolvedValue({ userIds: [] });
    await expect(controller.deactivateForUser('c1', 'u1')).resolves.toEqual({
      userIds: [],
    });
  });
});
