import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSingleImageDto {
  @ApiProperty({ description: 'The URL of the image to be displayed' })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ description: 'The URL to navigate to when the image is clicked' })
  @IsNotEmpty()
  @IsString()
  targetUrl: string;

  @ApiProperty({ description: 'Optional description for the image', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Position of the image in the slider', default: 0, required: false })
  @IsOptional()
  @IsInt()
  position?: number;
}
