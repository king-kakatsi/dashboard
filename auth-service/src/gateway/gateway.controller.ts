import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller() // Routes available at root level
// @UseGuards(JwtAuthGuard) // All routes require authentication
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.gatewayService.getUserDashboard(req.user.id);
  }

  // ===== Connectors Routes =====
  @Get('connectors')
  getConnectors(@Request() req) {
    try{
      return this.gatewayService.getConnectors(req.user.id);
    } catch (error){
      return this.gatewayService.getConnectors();
    }
  }

  @Get('connectors/:id')
  getConnector(@Param('id') id: string, @Request() req) {
    return this.gatewayService.getConnector(id, req.user.id);
  }

  @Post('connectors')
  createConnector(@Body() data: any, @Request() req) {
    return this.gatewayService.createConnector(data, req.user.id);
  }

  @Put('connectors/:id')
  updateConnector(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.gatewayService.updateConnector(id, data, req.user.id);
  }

  @Delete('connectors/:id')
  deleteConnector(@Param('id') id: string, @Request() req) {
    return this.gatewayService.deleteConnector(id, req.user.id);
  }

  // ===== Widgets Routes =====
  @Get('widgets')
  getWidgets(@Request() req) {
    try{
      return this.gatewayService.getWidgets(req.user.id);
    } catch (error){
      return this.gatewayService.getWidgets();
    }
  }

  @Get('widgets/:id')
  getWidget(@Param('id') id: string, @Request() req) {
    return this.gatewayService.getWidget(id, req.user.id);
  }

  @Post('widgets')
  createWidget(@Body() data: any, @Request() req) {
    return this.gatewayService.createWidget(data, req.user.id);
  }

  @Put('widgets/:id')
  updateWidget(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.gatewayService.updateWidget(id, data, req.user.id);
  }

  @Delete('widgets/:id')
  deleteWidget(@Param('id') id: string, @Request() req) {
    return this.gatewayService.deleteWidget(id, req.user.id);
  }

  @Post('widgets/:id/refresh')
  refreshWidget(@Param('id') id: string, @Request() req) {
    return this.gatewayService.refreshWidget(id, req.user.id);
  }
}
