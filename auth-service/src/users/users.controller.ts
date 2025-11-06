import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CustomAuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(CustomAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Get current user profile
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  // Get all users (admin only)
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.usersService.findAll();
  }

  // Get user by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // Update current user profile
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log('DEBUG - users controller', user);
    return this.usersService.update(user.id, updateUserDto);
  }

  /**
   * Confirm update (no auth needed, just user ID in URL)
   */
  @Get('confirm-update/:userId')
  async confirmUpdate(@Param('userId') userId: string) {
    return this.usersService.confirmUpdate(userId);
  }

  // Update any user (admin only)
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // Delete user (admin only)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post('services/:serviceId')
  async connectService(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.usersService.addConnectedService(user.id, serviceId);
  }

  @Delete('services/:serviceId')
  async disconnectService(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.usersService.removeConnectedService(user.id, serviceId);
  }

  @Post('widgets/:widgetId')
  async activateWidget(
    @CurrentUser() user: any,
    @Param('widgetId') widgetId: string,
  ) {
    return this.usersService.addActiveWidget(user.id, widgetId);
  }

  @Delete('widgets/:widgetId')
  async deactivateWidget(
    @CurrentUser() user: any,
    @Param('widgetId') widgetId: string,
  ) {
    return this.usersService.removeActiveWidget(user.id, widgetId);
  }
}
