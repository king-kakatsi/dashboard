import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: { getHello: () => 'Hello World!' } },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('returns the greeting', () => {
    expect(controller.getHello()).toBe('Hello World!');
  });

  it('reports a healthy service', () => {
    const health = controller.getHealth();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('auth-service');
  });
});
