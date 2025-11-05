import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConnectorDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
