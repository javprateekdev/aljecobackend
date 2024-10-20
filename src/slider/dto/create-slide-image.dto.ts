import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlideImageDto {
  @ApiProperty({ description: 'The URL of the image to be displayed' })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ description: 'Foreign key to reference Slide' })
  @IsNotEmpty()
  @IsInt()
  slideId: number;
}
