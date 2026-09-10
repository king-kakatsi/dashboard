import { execSync } from 'child_process';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { MailerService } from '@nestjs-modules/mailer';
import { AppModule } from './../src/app.module';
import prisma from '../lib/prisma';

const E2E_DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/dashboard_auth_e2e';

describe('Auth lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let agent: ReturnType<typeof request.agent>;
  let userId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = E2E_DATABASE_URL;
    process.env.JWT_SECRET = 'e2e-test-secret';
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef';
    process.env.GOOGLE_CLIENT_ID = 'test-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
    process.env.GITHUB_CLIENT_ID = 'test-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-secret';
    process.env.FRONTEND_URL = 'http://frontend.test';

    execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
      stdio: 'pipe',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    agent = request.agent(app.getHttpServer());
  }, 240000);

  afterAll(async () => {
    await app.close();
    await prisma.$runCommandRaw({ dropDatabase: 1 });
    await prisma.$disconnect();
  });

  it('registers a user with session cookie', async () => {
    const res = await agent.post('/auth/register').send({
      email: 'e2e@example.com',
      username: 'e2euser',
      password: 'Strong1!',
      passwordConfirmation: 'Strong1!',
    });
    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    userId = res.body.user.id;
    expect(res.headers['set-cookie'].join()).toMatch(/access_token/);
  });

  it('rejects duplicate registration', async () => {
    await agent
      .post('/auth/register')
      .send({
        email: 'e2e@example.com',
        username: 'other',
        password: 'Strong1!',
        passwordConfirmation: 'Strong1!',
      })
      .expect(400);
  });

  it('rejects a weak password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'weak@example.com',
        username: 'weakuser',
        password: 'weak',
        passwordConfirmation: 'weak',
      })
      .expect(400);
  });

  it('rejects wrong credentials and logs in with the right ones', async () => {
    await agent
      .post('/auth/login')
      .send({ email: 'e2e@example.com', password: 'Wrong1!' })
      .expect(401);

    await agent
      .post('/auth/login')
      .send({ email: 'e2e@example.com', password: 'Strong1!' })
      .expect(200);
  });

  it('serves the profile to the session and 401 to strangers', async () => {
    const me = await agent.get('/auth/me').expect(200);
    expect(me.body.username).toBe('e2euser');

    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('changes the password and enforces it', async () => {
    await agent
      .put('/auth/change-password')
      .send({ currentPassword: 'Wrong1!', newPassword: 'Newer11!!' })
      .expect(400);

    await agent
      .put('/auth/change-password')
      .send({ currentPassword: 'Strong1!', newPassword: 'Newer11!!' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e@example.com', password: 'Strong1!' })
      .expect(401);

    await agent
      .post('/auth/login')
      .send({ email: 'e2e@example.com', password: 'Newer11!!' })
      .expect(200);
  });

  it('verifies the email through the mailed link', async () => {
    await agent.post(`/auth/verify-email/${userId}`).expect(201);

    await agent
      .get(`/auth/confirm-email/${userId}`)
      .expect(302)
      .expect('Location', /email-confirmed/);

    const me = await agent.get('/auth/me').expect(200);
    expect(me.body.verified).toBe(true);
  });

  it('stages then confirms a profile email change', async () => {
    const staged = await agent
      .put('/users/profile')
      .send({ standByEmail: 'moved@example.com' })
      .expect(200);
    expect(staged.body.message).toMatch(/confirmation email/i);

    await agent.get(`/users/confirm-update/${userId}`).expect(200);

    const profile = await agent.get('/users/profile').expect(200);
    expect(profile.body.email).toBe('moved@example.com');
  });

  it('forbids the admin list to users and opens it to admins', async () => {
    await agent.get('/users').expect(401);

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });
    await agent
      .post('/auth/login')
      .send({ email: 'moved@example.com', password: 'Newer11!!' })
      .expect(200);

    const list = await agent.get('/users').expect(200);
    expect(Array.isArray(list.body)).toBe(true);
  });
});
