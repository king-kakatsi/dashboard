import { Controller, Get } from '@nestjs/common';

@Controller('widgets')
export class GoogleController {
  //gmail widget
  /** Returns three fixed demo messages, never live mail. */
  @Get('gmail')
  async getGmailInbox() {
    // simulation
    return [
      { from: 'Alice', subject: 'Projet Zémi terminé', date: '2025-11-06' },
      { from: 'Bob', subject: 'Mise à jour du Dashboard', date: '2025-11-05' },
      {
        from: 'Google',
        subject: 'Nouvelle connexion détectée',
        date: '2025-11-04',
      },
    ];
  }

  //translate widget
  /** Describes the translate widget with a fixed example. */
  @Get('translate')
  async getTranslateWidget() {
    return {
      description:
        'Ce widget permet de traduire du texte via Google Translate API',
      example: 'Bonjour → Hello',
    };
  }
}
