import { GatewayController } from './gateway.controller';

describe('GatewayController', () => {
  let controller: GatewayController;
  let service: Record<string, jest.Mock>;
  const request = { user: { id: 'u1' } };

  beforeEach(() => {
    service = {
      getUserDashboard: jest.fn(),
      getConnectors: jest.fn(),
      getConnector: jest.fn(),
      createConnector: jest.fn(),
      updateConnector: jest.fn(),
      deleteConnector: jest.fn(),
      getWidgets: jest.fn(),
      getWidget: jest.fn(),
      createWidget: jest.fn(),
      updateWidget: jest.fn(),
      deleteWidget: jest.fn(),
      refreshWidget: jest.fn(),
    };
    controller = new GatewayController(service as any);
  });

  it('serves the user dashboard', async () => {
    service.getUserDashboard.mockResolvedValue({ connectors: [] });
    await expect(controller.getDashboard(request as any)).resolves.toEqual({
      connectors: [],
    });
    expect(service.getUserDashboard).toHaveBeenCalledWith('u1');
  });

  it('falls back to public connectors when the user call fails', async () => {
    service.getConnectors
      .mockImplementationOnce(() => {
        throw new Error('no user');
      })
      .mockResolvedValueOnce([{ title: 'A' }]);
    await expect(controller.getConnectors(request as any)).resolves.toEqual([
      { title: 'A' },
    ]);
    expect(service.getConnectors).toHaveBeenLastCalledWith();
  });

  it('falls back to public widgets when the user call fails', async () => {
    service.getWidgets
      .mockImplementationOnce(() => {
        throw new Error('no user');
      })
      .mockResolvedValueOnce([{ name: 'W' }]);
    await expect(controller.getWidgets(request as any)).resolves.toEqual([
      { name: 'W' },
    ]);
  });

  it('delegates the remaining routes with the user id', async () => {
    await controller.getConnector('c1', request as any);
    expect(service.getConnector).toHaveBeenCalledWith('c1', 'u1');
    await controller.createConnector({ title: 'A' }, request as any);
    expect(service.createConnector).toHaveBeenCalledWith({ title: 'A' }, 'u1');
    await controller.updateConnector('c1', { title: 'B' }, request as any);
    expect(service.updateConnector).toHaveBeenCalledWith(
      'c1',
      { title: 'B' },
      'u1',
    );
    await controller.deleteConnector('c1', request as any);
    expect(service.deleteConnector).toHaveBeenCalledWith('c1', 'u1');
    await controller.getWidget('w1', request as any);
    expect(service.getWidget).toHaveBeenCalledWith('w1', 'u1');
    await controller.createWidget({ name: 'W' }, request as any);
    expect(service.createWidget).toHaveBeenCalledWith({ name: 'W' }, 'u1');
    await controller.updateWidget('w1', { name: 'W2' }, request as any);
    expect(service.updateWidget).toHaveBeenCalledWith(
      'w1',
      { name: 'W2' },
      'u1',
    );
    await controller.deleteWidget('w1', request as any);
    expect(service.deleteWidget).toHaveBeenCalledWith('w1', 'u1');
    await controller.refreshWidget('w1', request as any);
    expect(service.refreshWidget).toHaveBeenCalledWith('w1', 'u1');
  });
});
