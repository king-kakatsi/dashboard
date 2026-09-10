import { AuthController } from './auth.controller';

const FRONTEND_URL = 'http://frontend.test';

function mockResponse() {
  const response: any = {};
  response.cookie = jest.fn().mockReturnValue(response);
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.redirect = jest.fn().mockReturnValue(response);
  response.clearCookie = jest.fn().mockReturnValue(response);
  return response;
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: Record<string, jest.Mock>;
  let config: { get: jest.Mock };

  beforeEach(() => {
    service = {
      register: jest.fn(),
      login: jest.fn(),
      checkFile: jest.fn(),
      uploadImage: jest.fn(),
      generateJwtToken: jest.fn(),
      getOAuthToken: jest.fn(),
      changePassword: jest.fn(),
      sendMail: jest.fn(),
      confirmMail: jest.fn(),
    };
    config = { get: jest.fn(() => FRONTEND_URL) };
    controller = new AuthController(service as any, config as any);
    jest.clearAllMocks();
  });

  it('registers a user and sets the cookie', async () => {
    service.register.mockResolvedValue({
      access_token: 'token',
      user: { id: 'u1' },
    });
    const response = mockResponse();
    await controller.register(
      { email: 'u@test' } as any,
      undefined as any,
      response,
    );

    expect(service.register).toHaveBeenCalled();
    expect(response.cookie).toHaveBeenCalledWith(
      'access_token',
      'token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('uploads a profile image during registration', async () => {
    service.checkFile.mockReturnValue(true);
    service.uploadImage.mockResolvedValue('https://img/1.png');
    service.register.mockResolvedValue({ access_token: 't', user: {} });
    const response = mockResponse();
    const file = { originalname: 'me.png' };

    await controller.register(
      { email: 'u@test' } as any,
      file as any,
      response,
    );

    expect(service.uploadImage).toHaveBeenCalledWith(file, 'profiles');
    expect(service.register).toHaveBeenCalledWith(
      expect.objectContaining({ image: 'https://img/1.png' }),
    );
  });

  it('rejects an invalid profile image', async () => {
    service.checkFile.mockReturnValue(false);
    const response = mockResponse();

    await controller.register(
      {} as any,
      { originalname: 'x' } as any,
      response,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(service.register).not.toHaveBeenCalled();
  });

  it('maps registration failures to 400', async () => {
    service.register.mockRejectedValue(new Error('taken'));
    const response = mockResponse();
    await controller.register({} as any, undefined as any, response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'taken' }),
    );
  });

  it('logs a user in and sets the cookie', async () => {
    service.login.mockResolvedValue({ access_token: 'token', user: {} });
    const response = mockResponse();
    await controller.login({ email: 'u@test' } as any, response);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.cookie).toHaveBeenCalled();
  });

  it('maps login failures to 401', async () => {
    service.login.mockRejectedValue(new Error('bad'));
    const response = mockResponse();
    await controller.login({} as any, response);
    expect(response.status).toHaveBeenCalledWith(401);
  });

  it('finishes OAuth callbacks with a cookie and a frontend redirect', async () => {
    service.generateJwtToken.mockReturnValue('oauth-jwt');
    for (const callback of [
      controller.googleAuthCallback.bind(controller),
      controller.githubAuthCallback.bind(controller),
    ]) {
      const response = mockResponse();
      await callback({ user: { id: 'u1' } } as any, response);
      expect(response.cookie).toHaveBeenCalledWith(
        'access_token',
        'oauth-jwt',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining('oauth-jwt'),
      );
    }
  });

  it('reads the current user and OAuth token', async () => {
    await expect(controller.getMe({ id: 'u1' })).resolves.toEqual({ id: 'u1' });
    service.getOAuthToken.mockResolvedValue('decrypted');
    await expect(controller.getOAuthToken({ id: 'u1' })).resolves.toEqual({
      access_token: 'decrypted',
    });
  });

  it('logs out by clearing the cookie', async () => {
    const response = mockResponse();
    await controller.logout(response);
    expect(response.clearCookie).toHaveBeenCalledWith('access_token');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('sends verification emails and confirms them', async () => {
    service.sendMail.mockResolvedValue({});
    await expect(controller.sendVerificationEmail('u1')).resolves.toEqual({
      message: 'Verification email sent',
    });

    service.confirmMail.mockResolvedValue({});
    const response = mockResponse();
    await controller.confirmEmail('u1', response);
    expect(response.redirect).toHaveBeenCalledWith(
      `${FRONTEND_URL}/email-confirmed`,
    );

    service.confirmMail.mockRejectedValue(new Error('gone'));
    const failure = mockResponse();
    await controller.confirmEmail('missing', failure);
    expect(failure.status).toHaveBeenCalledWith(400);
  });

  it('delegates password changes to the service', async () => {
    service.changePassword.mockResolvedValue({ message: 'done' });
    await expect(
      controller.changePassword({ id: 'u1' }, {
        currentPassword: 'old',
        newPassword: 'New1!pass',
      } as any),
    ).resolves.toEqual({ message: 'done' });
    expect(service.changePassword).toHaveBeenCalledWith(
      'u1',
      'old',
      'New1!pass',
    );
  });
});
