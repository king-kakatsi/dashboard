import * as fs from 'fs';
import * as path from 'path';

export class EmailTemplateUtil {
  private static templatesPath = path.join(
    process.cwd(),
    'src',
    'email-templates',
  );

  /**
   * Load and compile an email template
   * @param templateName - Name of the template file (without .html)
   * @param variables - Object with key-value pairs to replace {{key}} in template
   */
  /**
   * Fills {{key}} placeholders in an HTML template.
   *
   * @throws Error When the template file does not exist
   */
  static loadTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    try {
      const templatePath = path.join(
        this.templatesPath,
        `${templateName}.html`,
      );
      let template = fs.readFileSync(templatePath, 'utf-8');

      // Replace all {{variable}} with actual values
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });

      return template;
    } catch (error) {
      console.error(`Failed to load template ${templateName}:`, error);
      throw new Error(`Email template ${templateName} not found`);
    }
  }

  /**
   * Quick method for verification email
   */
  static getVerificationEmail(
    username: string,
    verificationLink: string,
  ): string {
    return this.loadTemplate('verificationEmail', {
      username,
      verificationLink,
    });
  }

  /**
   * Builds the email-change confirmation with optional blocks.
   *
   * Sections wrapped in {{#if newEmail}} style markers are kept only when
   * that value exists, so one template serves email-only, username-only,
   * and combined changes.
   */
  static getUpdateConfirmationEmail(
    username: string,
    confirmationLink: string,
    newEmail?: string,
    newUsername?: string,
  ): string {
    let template = this.loadTemplate('updateConfirmation', {
      username,
      confirmationLink,
      newEmail: newEmail || '',
      newUsername: newUsername || '',
    });

    // Handle conditional sections
    if (!newEmail) {
      template = template.replace(/{{#if newEmail}}[\s\S]*?{{\/if}}/g, '');
    } else {
      template = template.replace(/{{#if newEmail}}/g, '').replace(/{{\/if}}/g, '');
    }

    if (!newUsername) {
      template = template.replace(/{{#if newUsername}}[\s\S]*?{{\/if}}/g, '');
    } else {
      template = template.replace(/{{#if newUsername}}/g, '').replace(/{{\/if}}/g, '');
    }

    return template;
  }
}
