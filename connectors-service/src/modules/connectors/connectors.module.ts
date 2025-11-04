import { Module } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { ConnectorSchema } from './schemas/connector.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Connector', schema: ConnectorSchema }]),
  ],
  providers: [ConnectorsService],
  controllers: [ConnectorsController],
})
export class ConnectorsModule {}
