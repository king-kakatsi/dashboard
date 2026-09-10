import { RolesGuard } from './roles.guard';

function mockContext(request: Record<string, any>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
  } as any;
}

describe('RolesGuard', () => {
  it('allows requests when no roles are required', () => {
    const guard = new RolesGuard({
      get: jest.fn().mockReturnValue(undefined),
    } as any);
    expect(guard.canActivate(mockContext({}))).toBe(true);
  });

  it('allows a user holding a required role', () => {
    const guard = new RolesGuard({
      get: jest.fn().mockReturnValue(['ADMIN']),
    } as any);
    expect(guard.canActivate(mockContext({ user: { role: 'ADMIN' } }))).toBe(
      true,
    );
  });

  it('denies a user missing the required role', () => {
    const guard = new RolesGuard({
      get: jest.fn().mockReturnValue(['ADMIN']),
    } as any);
    expect(guard.canActivate(mockContext({ user: { role: 'USER' } }))).toBe(
      false,
    );
  });
});
