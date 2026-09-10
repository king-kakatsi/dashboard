import { UnauthorizedException } from '@nestjs/common';
import { CustomAuthGuard } from './auth.guard';

function mockContext(request: Record<string, any>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
  } as any;
}

describe('CustomAuthGuard', () => {
  let authService: { verifyToken: jest.Mock };
  let reflector: { get: jest.Mock };

  beforeEach(() => {
    authService = { verifyToken: jest.fn() };
    reflector = { get: jest.fn() };
  });

  function guard() {
    return new CustomAuthGuard(authService as any, reflector as any);
  }

  it('accepts a Bearer token and attaches the user', async () => {
    authService.verifyToken.mockResolvedValue({ id: 'u1', role: 'USER' });
    reflector.get.mockReturnValue(undefined);
    const request: Record<string, any> = {
      headers: { authorization: 'Bearer good-token' },
    };

    await expect(guard().canActivate(mockContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'u1', role: 'USER' });
  });

  it('accepts the cookie token', async () => {
    authService.verifyToken.mockResolvedValue({ id: 'u1', role: 'USER' });
    reflector.get.mockReturnValue(undefined);
    const request: Record<string, any> = {
      headers: {},
      cookies: { access_token: 'cookie-token' },
    };

    await expect(guard().canActivate(mockContext(request))).resolves.toBe(true);
    expect(authService.verifyToken).toHaveBeenCalledWith('cookie-token');
  });

  it('rejects a request without any token', async () => {
    await expect(
      guard().canActivate(mockContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an invalid token', async () => {
    authService.verifyToken.mockRejectedValue(new Error('bad'));
    await expect(
      guard().canActivate(
        mockContext({ headers: { authorization: 'Bearer bad' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a user missing the required role', async () => {
    authService.verifyToken.mockResolvedValue({ id: 'u1', role: 'USER' });
    reflector.get.mockReturnValue(['ADMIN']);
    await expect(
      guard().canActivate(
        mockContext({ headers: { authorization: 'Bearer good' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a user holding the required role', async () => {
    authService.verifyToken.mockResolvedValue({ id: 'u1', role: 'ADMIN' });
    reflector.get.mockReturnValue(['ADMIN']);
    await expect(
      guard().canActivate(
        mockContext({ headers: { authorization: 'Bearer good' } }),
      ),
    ).resolves.toBe(true);
  });
});
