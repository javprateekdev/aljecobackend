import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlideDto {
  @ApiProperty({ description: 'Title for the slide', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The URL to navigate to when the slide is clicked', required: false })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiProperty({ description: 'Optional description for the slide', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Position of the slide in the slider', required: false })
  @IsOptional()
  @IsInt()
  position?: number;
}
