import { GithubStrategy } from './github.strategy';

describe('GithubStrategy', () => {
  const configService = { get: jest.fn(() => 'test-value') } as any;
  let authService: { validateOAuthUser: jest.Mock };

  beforeEach(() => {
    authService = { validateOAuthUser: jest.fn() };
  });

  function strategy() {
    return new GithubStrategy(configService, authService as any);
  }

  it('passes the validated user to the callback', async () => {
    authService.validateOAuthUser.mockResolvedValue({ id: 'u1' });
    const done = jest.fn();
    await strategy().validate('access', 'refresh', { id: 'gh1' }, done);
    expect(authService.validateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'gh1',
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
      'github',
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u1' });
  });

  it('passes validation errors to the callback', async () => {
    authService.validateOAuthUser.mockRejectedValue(new Error('taken'));
    const done = jest.fn();
    await strategy().validate('access', 'refresh', { id: 'gh1' }, done);
    expect(done).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
