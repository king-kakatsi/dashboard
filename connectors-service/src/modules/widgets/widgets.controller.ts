import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from './dto/create-widgets.dto';
import { UpdateWidgetDto } from './dto/update-widgets.dto';

@Controller('widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto) {
    return this.widgetsService.create(dto);
  }

  @Get()
  findAll() {
    return this.widgetsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.widgetsService.findByUser(userId);
  }

  @Get('service/:serviceId')
  findByService(@Param('serviceId') serviceId: string) {
    return this.widgetsService.findByService(serviceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.widgetsService.findOne(id);
  }

  @Get(':id/fetch')
  fetchWidgetData(
    @Param('id') id: string,
    @Query() queryParams: Record<string, any>,
  ) {
    return this.widgetsService.fetchWidgetData(id, queryParams);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.widgetsService.remove(id);
  }

  @Put(':widgetId/user/:userId/position')
  updatePosition(
    @Param('widgetId') widgetId: string,
    @Param('userId') userId: string,
    @Body('position') position: { x: number; y: number },
  ) {
    return this.widgetsService.updateUserPosition(widgetId, userId, position);
  }

  @Post(':id/activate/:userId')
  activateForUser(
    @Param('id') widgetId: string,
    @Param('userId') userId: string,
  ) {
    return this.widgetsService.activateForUser(widgetId, userId);
  }

  @Delete(':id/deactivate/:userId')
  deactivateForUser(
    @Param('id') widgetId: string,
    @Param('userId') userId: string,
  ) {
    return this.widgetsService.deactivateForUser(widgetId, userId);
  }
}