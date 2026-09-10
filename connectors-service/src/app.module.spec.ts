import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let memoryServer: MongoMemoryServer;

  beforeAll(async () => {
    memoryServer = await MongoMemoryServer.create();
    process.env.DATABASE_URL = memoryServer.getUri();
  }, 180000);

  afterAll(async () => {
    delete process.env.DATABASE_URL;
    await memoryServer.stop();
  });

  it('compiles and initializes without missing dependencies', async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleReference).toBeDefined();
    await moduleReference.close();
  }, 120000);
});
