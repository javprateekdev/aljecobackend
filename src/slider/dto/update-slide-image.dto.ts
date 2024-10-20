import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlideImageDto {
  @ApiProperty({ description: 'The URL of the image to be displayed', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Foreign key to reference Slide', required: false })
  @IsOptional()
  @IsInt()
  slideId?: number;
}
