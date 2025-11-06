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

}
