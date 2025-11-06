import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsUrl
} from 'class-validator';

export class CreateWidgetDto {
  //   @IsOptional()
  //   @IsArray()
  //   @IsString({ each: true })
  //   userIds?: string[];
  @IsString()
  @IsOptional()
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

  @IsNotEmpty()
  @IsUrl()
  icon: string;

  @IsOptional()
  @IsNumber()
  refreshRate?: number;
}
