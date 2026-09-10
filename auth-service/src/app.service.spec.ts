import { AppService } from './app.service';

describe('AppService', () => {
  it('returns the greeting', () => {
    expect(new AppService().getHello()).toBe('Hello World!');
  });
});
