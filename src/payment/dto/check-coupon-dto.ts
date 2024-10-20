import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckCouponDto {
  @ApiProperty({ description: 'Coupon code to be validated' })
  @IsString()
  couponCode: string;
}
