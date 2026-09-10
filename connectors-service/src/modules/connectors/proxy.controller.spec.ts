import axios from 'axios';
import { ProxyController } from './proxy.controller';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

const mockParseURL = jest.fn();
jest.mock('rss-parser', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ parseURL: mockParseURL })),
}));

const AUTH_URL = 'http://auth.test';
const FRONTEND_URL = 'http://frontend.test';

function mockConfig(values: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as any;
}

function mockResponse() {
  const response: any = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.send = jest.fn().mockReturnValue(response);
  response.redirect = jest.fn().mockReturnValue(response);
  response.setHeader = jest.fn().mockReturnValue(response);
  return response;
}

describe('ProxyController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a non-http baseUrl', async () => {
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy('ftp://evil/x' as any, '/rss' as any, response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it('renders news feeds as HTML', async () => {
    mockParseURL.mockResolvedValue({
      items: [{ title: 'Big win', link: 'https://n.test/1', creator: 'N' }],
    });
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy('https://news.google.com', '/rss', response);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/html',
    );
    expect(response.send).toHaveBeenCalledWith(
      expect.stringContaining('Big win'),
    );
  });

  it('renders gmail messages as HTML when a token exists', async () => {
    axiosMock.get.mockImplementation((url: string) => {
      if (url.includes('oauth-token')) {
        return Promise.resolve({ data: { access_token: 'token123' } });
      }
      return Promise.resolve({ data: { messages: [] } });
    });
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy(
      'https://gmail.googleapis.com',
      '/gmail/v1/users/me/messages',
      response,
    );
    expect(response.send).toHaveBeenCalledWith(
      expect.stringContaining('Recent Emails'),
    );
  });

  it('redirects to Google login when gmail needs a missing token', async () => {
    axiosMock.get.mockRejectedValue(new Error('no cookie'));
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy(
      'https://gmail.googleapis.com',
      '/gmail/v1/users/me/messages',
      response,
    );
    expect(response.redirect).toHaveBeenCalledWith(`${AUTH_URL}/auth/google`);
  });

  it('renders gmail message details as HTML', async () => {
    axiosMock.get.mockImplementation((url: string) => {
      if (url.includes('oauth-token')) {
        return Promise.resolve({ data: { access_token: 'token123' } });
      }
      if (url.includes('/messages/')) {
        return Promise.resolve({
          data: {
            payload: {
              headers: [
                { name: 'From', value: 'alice@test' },
                { name: 'Subject', value: 'Hello' },
              ],
            },
            snippet: 'preview text',
          },
        });
      }
      return Promise.resolve({ data: { messages: [{ id: 'm1' }] } });
    });
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy(
      'https://gmail.googleapis.com',
      '/gmail/v1/users/me/messages',
      response,
    );
    expect(response.send).toHaveBeenCalledWith(
      expect.stringContaining('alice@test'),
    );
  });

  it('passes public APIs through as JSON', async () => {
    axiosMock.get.mockResolvedValue({ data: { hello: 'world' } });
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy('https://api.example.com', '/things', response);
    expect(response.json).toHaveBeenCalledWith({ hello: 'world' });
  });

  it('redirects to Google login on upstream 401', async () => {
    axiosMock.get.mockRejectedValue({
      response: { status: 401 },
      message: 'unauthorized',
    });
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy('https://api.example.com', '/things', response);
    expect(response.redirect).toHaveBeenCalledWith(`${AUTH_URL}/auth/google`);
  });

  it('returns 500 with details on upstream failure', async () => {
    axiosMock.get.mockRejectedValue({
      response: { status: 500 },
      message: 'boom',
    });
    const controller = new ProxyController(
      mockConfig({ AUTH_SERVICE_URL: AUTH_URL }),
    );
    const response = mockResponse();
    await controller.proxy('https://api.example.com', '/things', response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it('exchanges an OAuth code and redirects to the frontend', async () => {
    axiosMock.post.mockResolvedValue({ data: { access_token: 'fresh' } });
    const controller = new ProxyController(
      mockConfig({
        GOOGLE_CLIENT_ID: 'id',
        GOOGLE_CLIENT_SECRET: 'secret',
        FRONTEND_URL,
      }),
    );
    const response = mockResponse();
    await controller.googleCallback('code123', response);
    expect(axiosMock.post).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({ code: 'code123' }),
    );
    expect(response.redirect).toHaveBeenCalledWith(FRONTEND_URL);
  });

  it('reports authentication failure when the exchange fails', async () => {
    axiosMock.post.mockRejectedValue(new Error('bad code'));
    const controller = new ProxyController(mockConfig({}));
    const response = mockResponse();
    await controller.googleCallback('bad', response);
    expect(response.send).toHaveBeenCalledWith('Authentication failed.');
  });
});
