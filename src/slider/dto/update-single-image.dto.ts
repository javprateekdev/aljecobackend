import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSingleImageDto {
  @ApiProperty({ description: 'The URL of the image to be displayed', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'The URL to navigate to when the image is clicked', required: false })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiProperty({ description: 'Optional description for the image', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Position of the image in the slider', required: false })
  @IsOptional()
  @IsInt()
  position?: number;
}
