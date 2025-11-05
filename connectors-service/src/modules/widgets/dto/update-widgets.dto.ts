import { PartialType } from '@nestjs/mapped-types';
import { CreateWidgetDto } from './create-widgets.dto';

export class UpdateWidgetDto extends PartialType(CreateWidgetDto) {}
