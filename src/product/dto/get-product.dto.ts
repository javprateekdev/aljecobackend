import { IsOptional, IsString, IsInt, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetProductsDto {
  @ApiProperty({ required: false, description: 'Search term for filtering products by name or description.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Number of items to skip for pagination.', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiProperty({ required: false, description: 'Number of items to take for pagination.', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 10;

  @ApiProperty({ required: false, description: 'Filter by dress type (ID).' })
  @IsOptional()
  dressType?: string;

  @ApiProperty({ required: false, description: 'Filter by length (ID).' })
  @IsOptional()
  lengths?: string;

  @ApiProperty({ required: false, description: 'Filter by neckline (ID).' })
  @IsOptional()
  neckLine?: string;

  @ApiProperty({ required: false, description: 'Filter by style (ID).' })
  @IsOptional()
  styles?: string;

  @ApiProperty({ required: false, description: 'Filter by sleeve length (ID).' })
  @IsOptional()
  sleeveLength?: string;

  @ApiProperty({ required: false, description: 'Filter by season (ID).' })
  @IsOptional()
  season?: string;

  @ApiProperty({ required: false, description: 'Filter by body fit (ID).' })
  @IsOptional()
  bodyFits?: string;

  @ApiProperty({ required: false, description: 'Filter by colour (ID).' })
  @IsOptional()
  colours?: string;
}
