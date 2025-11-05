import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateWidgetDto {
//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   userIds?: string[];
  @IsString()
  @IsNotEmpty()
  userIds: string;

  @IsString()
  serviceId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  functionName?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsNumber()
  refreshRate?: number;
}
