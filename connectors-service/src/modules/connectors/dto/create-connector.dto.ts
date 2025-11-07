import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateConnectorDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty()
    @IsUrl()
    icon: string;

    @IsNotEmpty()
    @IsUrl()
    baseUrl: string;

    @IsArray()
    @IsOptional()
    userIds?: string[];
}
