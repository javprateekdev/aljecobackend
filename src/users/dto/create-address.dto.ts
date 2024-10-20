import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsInt, IsPostalCode, IsISO31661Alpha2 } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'ID of the user the address belongs to' })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'First line of the address' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Second line of the address (optional)' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City of the address' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State of the address' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal code of the address', example: '12345' })
  @IsPostalCode('any')
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country code (ISO 3166 Alpha-2)', example: 'US' })
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'Indicates if the address is the default one' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
