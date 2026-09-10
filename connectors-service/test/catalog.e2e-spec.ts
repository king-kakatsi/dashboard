import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from './../src/app.module';

describe('Catalog (e2e)', () => {
  let app: INestApplication<App>;
  let memoryServer: MongoMemoryServer;
  let stub: Server;
  let stubUrl: string;

  beforeAll(async () => {
    memoryServer = await MongoMemoryServer.create();
    process.env.DATABASE_URL = memoryServer.getUri();

    stub = createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ live: true, path: req.url }));
    });
    await new Promise<void>((resolve) => stub.listen(0, resolve));
    stubUrl = `http://127.0.0.1:${(stub.address() as AddressInfo).port}`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, 180000);

  afterAll(async () => {
    await app.close();
    stub.close();
    delete process.env.DATABASE_URL;
    await memoryServer.stop();
  });

  it('/ (GET) and /health (GET)', async () => {
    await request(app.getHttpServer()).get('/').expect(200);
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        if (res.body.status !== 'ok') throw new Error('unhealthy');
      });
  });

  describe('connector and widget lifecycle', () => {
    let connectorId: string;
    let widgetId: string;

    it('creates a connector backed by the stub API', async () => {
      const res = await request(app.getHttpServer())
        .post('/connectors')
        .send({
          title: 'Stub Service',
          description: 'Local test double',
          icon: 'https://example.com/icon.png',
          baseUrl: stubUrl,
        })
        .expect(201);

      connectorId = res.body.data._id;
      expect(connectorId).toBeDefined();
    });

    it('rejects a connector with an invalid URL', async () => {
      await request(app.getHttpServer())
        .post('/connectors')
        .send({
          title: 'Bad',
          icon: 'not-a-url',
          baseUrl: stubUrl,
        })
        .expect(400);
    });

    it('creates a widget on the connector', async () => {
      const res = await request(app.getHttpServer())
        .post('/widgets')
        .send({
          serviceId: connectorId,
          name: 'Live feed',
          icon: 'https://example.com/icon.png',
          endpoint: '/live',
          refreshRate: 60,
        })
        .expect(201);

      widgetId = res.body._id;
      expect(widgetId).toBeDefined();
    });

    it('lists widgets by service', async () => {
      const res = await request(app.getHttpServer())
        .get(`/widgets/service/${connectorId}`)
        .expect(200);
      expect(res.body).toHaveLength(1);
    });

    it('fetches live data through the real HTTP stack', async () => {
      const res = await request(app.getHttpServer())
        .get(`/widgets/${widgetId}/fetch?city=paris`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({ live: true });
    });

    it('activates and deactivates a widget for a user', async () => {
      await request(app.getHttpServer())
        .post(`/widgets/${widgetId}/activate/user-1`)
        .expect(201);

      const listed = await request(app.getHttpServer())
        .get('/widgets/user/user-1')
        .expect(200);
      expect(listed.body).toHaveLength(1);

      await request(app.getHttpServer())
        .delete(`/widgets/${widgetId}/deactivate/user-1`)
        .expect(200);

      const empty = await request(app.getHttpServer())
        .get('/widgets/user/user-1')
        .expect(200);
      expect(empty.body).toHaveLength(0);
    });

    it('stores a user position', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const res = await request(app.getHttpServer())
        .put(`/widgets/${widgetId}/user/${userId}/position`)
        .send({ position: { x: 3, y: 4 } })
        .expect(200);
      expect(res.body.positions).toHaveLength(1);
    });

    it('returns 404 for unknown ids', async () => {
      const missing = '507f1f77bcf86cd799439012';
      await request(app.getHttpServer()).get(`/widgets/${missing}`).expect(404);
      await request(app.getHttpServer())
        .delete(`/connectors/${missing}`)
        .expect(404);
    });
  });

  describe('proxy', () => {
    it('passes a public API through as JSON', async () => {
      const res = await request(app.getHttpServer())
        .get(`/proxy?baseUrl=${stubUrl}&endpoint=/live`)
        .expect(200);
      expect(res.body).toMatchObject({ live: true });
    });

    it('rejects a non-http baseUrl', async () => {
      await request(app.getHttpServer())
        .get('/proxy?baseUrl=ftp://evil&endpoint=/x')
        .expect(400);
    });
  });
});
