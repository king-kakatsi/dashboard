import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectorsModule } from './connectors/connectors.module';
import { WidgetsModule } from './widgets/widgets.module';

@Module({
  imports: [ConnectorsModule, WidgetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
