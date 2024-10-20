import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({
    description: 'The unique code for the coupon',
    example: 'SUMMER2024',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 15.0,
  })
  @IsNumber()
  discount: number;

  @ApiProperty({
    description: 'Description of the coupon',
    example: '15% off on summer collection',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of discount (e.g., percentage, fixed)',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({
    description: 'Expiration date for the coupon (optional)',
    example: '2024-09-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiration?: string;

  @ApiProperty({
    description: 'Maximum number of times the coupon can be used (optional)',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;
}
