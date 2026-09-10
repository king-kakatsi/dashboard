import { EmailTemplateUtil } from './emailTemplate.utils';

describe('EmailTemplateUtil', () => {
  it('throws for a missing template', () => {
    expect(() => EmailTemplateUtil.loadTemplate('nope', {})).toThrow(
      /not found/,
    );
  });

  it('builds a verification email with username and link', () => {
    const html = EmailTemplateUtil.getVerificationEmail(
      'tester',
      'http://frontend.test/auth/confirm-email/u1',
    );
    expect(html).toContain('tester');
    expect(html).toContain('http://frontend.test/auth/confirm-email/u1');
    expect(html).not.toContain('{{username}}');
  });

  it('keeps the new email block when provided', () => {
    const html = EmailTemplateUtil.getUpdateConfirmationEmail(
      'tester',
      'http://frontend.test/confirm-update/u1',
      'new@test',
    );
    expect(html).toContain('new@test');
    expect(html).not.toContain('{{#if newEmail}}');
  });

  it('drops the conditional blocks when absent', () => {
    const html = EmailTemplateUtil.getUpdateConfirmationEmail(
      'tester',
      'http://frontend.test/confirm-update/u1',
    );
    expect(html).not.toContain('{{#if');
    expect(html).not.toContain('{{/if}}');
  });
});
