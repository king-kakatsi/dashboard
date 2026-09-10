import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
    process.env.GITHUB_CLIENT_ID = 'test-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-secret';
    process.env.MAIL_HOST = 'localhost';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USER = 'test@test';
    process.env.MAIL_PASS = 'test';
  });

  it('compiles without missing dependencies', async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleReference).toBeDefined();
    await moduleReference.close();
  });
});
