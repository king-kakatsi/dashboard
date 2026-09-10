import { GoogleController } from './google.controller';

describe('GoogleController', () => {
  let controller: GoogleController;

  beforeEach(() => {
    controller = new GoogleController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns mocked gmail messages', async () => {
    const inbox = await controller.getGmailInbox();
    expect(inbox).toHaveLength(3);
    expect(inbox[0]).toHaveProperty('from');
    expect(inbox[0]).toHaveProperty('subject');
  });

  it('returns the translate example', async () => {
    const widget = await controller.getTranslateWidget();
    expect(widget).toHaveProperty('description');
    expect(widget).toHaveProperty('example');
  });
});
