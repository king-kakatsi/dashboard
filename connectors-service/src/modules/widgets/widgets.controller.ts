import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.widgetsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.widgetsService.remove(id);
  }

  // ➕ Mettre à jour la position d’un widget pour un utilisateur
  @Put(':widgetId/user/:userId/position')
  updatePosition(
    @Param('widgetId') widgetId: string,
    @Param('userId') userId: string,
    @Body('position') position: { x: number; y: number },
  ) {
    return this.widgetsService.updateUserPosition(widgetId, userId, position);
  }

  // 🔍 Lister les widgets d’un utilisateur
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.widgetsService.findByUser(userId);
  }
}
