import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  const configService = { get: jest.fn(() => 'test-value') } as any;
  let authService: { validateOAuthUser: jest.Mock };

  beforeEach(() => {
    authService = { validateOAuthUser: jest.fn() };
  });

  function strategy() {
    return new GoogleStrategy(configService, authService as any);
  }

  it('passes the validated user to the callback', async () => {
    authService.validateOAuthUser.mockResolvedValue({ id: 'u1' });
    const done = jest.fn();
    await strategy().validate('access', 'refresh', { id: 'g1' }, done);
    expect(authService.validateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'g1',
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
      'google',
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u1' });
  });

  it('passes validation errors to the callback', async () => {
    authService.validateOAuthUser.mockRejectedValue(new Error('taken'));
    const done = jest.fn();
    await strategy().validate('access', 'refresh', { id: 'g1' }, done);
    expect(done).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
