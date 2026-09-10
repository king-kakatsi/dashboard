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
});
