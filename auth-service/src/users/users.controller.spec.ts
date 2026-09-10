import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let service: Record<string, jest.Mock>;
  const currentUser = { id: 'u1' };

  beforeEach(() => {
    service = {
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      confirmUpdate: jest.fn(),
      delete: jest.fn(),
      addConnectedService: jest.fn(),
      removeConnectedService: jest.fn(),
      addActiveWidget: jest.fn(),
      removeActiveWidget: jest.fn(),
    };
    controller = new UsersController(service as any);
  });

  it('reads the own profile and any user', async () => {
    service.findById.mockResolvedValue({ id: 'u1' });
    await expect(controller.getProfile(currentUser)).resolves.toEqual({
      id: 'u1',
    });
    await expect(controller.findOne('u2')).resolves.toEqual({ id: 'u1' });
    service.findAll.mockResolvedValue([{ id: 'u1' }]);
    await expect(controller.findAll()).resolves.toEqual([{ id: 'u1' }]);
  });

  it('updates profiles and confirms staged changes', async () => {
    service.update.mockResolvedValue({ id: 'u1' });
    await expect(
      controller.updateProfile(currentUser, { username: 'new' } as any),
    ).resolves.toEqual({ id: 'u1' });
    expect(service.update).toHaveBeenCalledWith('u1', { username: 'new' });
    service.confirmUpdate.mockResolvedValue({ message: 'done' });
    await expect(controller.confirmUpdate('u1')).resolves.toEqual({
      message: 'done',
    });
    await controller.update('u2', { username: 'x' } as any);
    expect(service.update).toHaveBeenCalledWith('u2', { username: 'x' });
    await controller.delete('u2');
    expect(service.delete).toHaveBeenCalledWith('u2');
  });

  it('links services and widgets', async () => {
    await controller.connectService(currentUser, 'github');
    expect(service.addConnectedService).toHaveBeenCalledWith('u1', 'github');
    await controller.disconnectService(currentUser, 'github');
    expect(service.removeConnectedService).toHaveBeenCalledWith('u1', 'github');
    await controller.activateWidget(currentUser, 'w1');
    expect(service.addActiveWidget).toHaveBeenCalledWith('u1', 'w1');
    await controller.deactivateWidget(currentUser, 'w1');
    expect(service.removeActiveWidget).toHaveBeenCalledWith('u1', 'w1');
  });
});
