import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { CreateConnectorDto } from './dto/create-connector.dto';
import { UpdateConnectorDto } from './dto/update-connector.dto';

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Post()
  async create(@Body() createConnectorDto: CreateConnectorDto) {
    return this.connectorsService.create(createConnectorDto);
  }

  @Get()
  async findAll() {
    return this.connectorsService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return this.connectorsService.findOne(id);
  // }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConnectorDto: UpdateConnectorDto,
  ) {
    return this.connectorsService.update(id, updateConnectorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.connectorsService.remove(id);
    return { message: 'Connector deleted successfully' };
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.connectorsService.findByUser(userId);
  }

  @Post(':id/activate/:userId')
  activateForUser(
    @Param('id') connectorId: string,
    @Param('userId') userId: string,
  ) {
    return this.connectorsService.activateForUser(connectorId, userId);
  }

  @Delete(':id/deactivate/:userId')
  deactivateForUser(
    @Param('id') connectorId: string,
    @Param('userId') userId: string,
  ) {
    return this.connectorsService.deactivateForUser(connectorId, userId);
  }
}
