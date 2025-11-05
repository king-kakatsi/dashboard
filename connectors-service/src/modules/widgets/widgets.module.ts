import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';
import { Connector, ConnectorSchema } from '../connectors/schemas/connector.schema';
import { Widget, WidgetSchema } from './schemas/widgets.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Widget.name, schema: WidgetSchema },
      { name: Connector.name, schema: ConnectorSchema },
    ]),
  ],
  controllers: [WidgetsController],
  providers: [WidgetsService],
  exports: [WidgetsService],
})
export class WidgetsModule { }
