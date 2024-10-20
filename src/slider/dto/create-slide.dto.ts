import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlideDto {
  @ApiProperty({ description: 'Title for the slide' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The URL to navigate to when the slide is clicked' })
  @IsNotEmpty()
  @IsString()
  targetUrl: string;

  @ApiProperty({ description: 'Optional description for the slide', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Position of the slide in the slider', default: 0, required: false })
  @IsOptional()
  @IsInt()
  position?: number;
}
