import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import axios from 'axios';
import { GatewayService } from './gateway.service';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('GatewayService', () => {
  let service: GatewayService;
  let connectorClient: Record<string, jest.Mock>;

  beforeEach(async () => {
    jest.clearAllMocks();
    connectorClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    axiosMock.create.mockReturnValue(connectorClient as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'http://connectors.test') },
        },
      ],
    }).compile();

    service = module.get<GatewayService>(GatewayService);
  });

  it('points the client at the connectors service', () => {
    expect(axiosMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'http://connectors.test' }),
    );
  });

  it('fetches all connectors without a user', async () => {
    connectorClient.get.mockResolvedValue({ data: [{ title: 'A' }] });
    await expect(service.getConnectors()).resolves.toEqual([{ title: 'A' }]);
    expect(connectorClient.get).toHaveBeenCalledWith(
      '/connectors',
      expect.objectContaining({ headers: { 'X-User-Id': undefined } }),
    );
  });

  it('fetches user connectors with a user', async () => {
    connectorClient.get.mockResolvedValue({ data: [] });
    await service.getConnectors('u1');
    expect(connectorClient.get).toHaveBeenCalledWith(
      '/connectors/user/u1',
      expect.objectContaining({ headers: { 'X-User-Id': 'u1' } }),
    );
  });

  it('forwards connector and widget writes', async () => {
    connectorClient.post.mockResolvedValue({ data: { id: 'c1' } });
    connectorClient.put.mockResolvedValue({ data: { id: 'c1' } });
    connectorClient.delete.mockResolvedValue({ data: {} });

    await service.createConnector({ title: 'A' }, 'u1');
    expect(connectorClient.post).toHaveBeenCalledWith(
      '/connectors',
      { title: 'A' },
      expect.anything(),
    );
    await service.updateConnector('c1', { title: 'B' }, 'u1');
    expect(connectorClient.put).toHaveBeenCalledWith(
      '/connectors/c1',
      { title: 'B' },
      expect.anything(),
    );
    await service.deleteConnector('c1', 'u1');
    expect(connectorClient.delete).toHaveBeenCalledWith(
      '/connectors/c1',
      expect.anything(),
    );
    await service.createWidget({ name: 'W' }, 'u1');
    await service.updateWidget('w1', { name: 'W2' }, 'u1');
    await service.deleteWidget('w1', 'u1');
    await service.refreshWidget('w1', 'u1');
    expect(connectorClient.post).toHaveBeenCalledWith(
      '/widgets/w1/refresh',
      undefined,
      expect.anything(),
    );
  });

  it('reads single connector and widget resources', async () => {
    connectorClient.get.mockResolvedValue({ data: { id: 'c1' } });
    await service.getConnector('c1', 'u1');
    expect(connectorClient.get).toHaveBeenCalledWith(
      '/connectors/c1',
      expect.anything(),
    );
    await service.getWidget('w1', 'u1');
    expect(connectorClient.get).toHaveBeenCalledWith(
      '/widgets/w1',
      expect.anything(),
    );
  });

  it('maps upstream errors to their status', async () => {
    connectorClient.get.mockRejectedValue({
      response: { status: 404, data: { message: 'gone' } },
    });
    const error = await service.getConnectors('u1').catch((cause) => cause);
    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(404);
  });

  it('maps network failures to 503', async () => {
    connectorClient.get.mockRejectedValue(new Error('down'));
    const error = await service.getConnectors('u1').catch((cause) => cause);
    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(503);
  });

  it('merges connectors and widgets into a dashboard', async () => {
    connectorClient.get.mockImplementation((path: string) => {
      if (path.startsWith('/connectors')) {
        return Promise.resolve({ data: [{ title: 'A' }] });
      }
      return Promise.resolve({ data: [{ name: 'W' }] });
    });
    await expect(service.getUserDashboard('u1')).resolves.toEqual({
      connectors: [{ title: 'A' }],
      widgets: [{ name: 'W' }],
    });
  });

  it('maps dashboard failures to 500', async () => {
    connectorClient.get.mockRejectedValue(new Error('down'));
    const error = await service.getUserDashboard('u1').catch((cause) => cause);
    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(500);
  });
});
