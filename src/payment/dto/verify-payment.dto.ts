import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'DB_Order_ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Razorpay Order ID',
    example: 'order_FfVXTjwiEVyf4P',
  })
  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @ApiProperty({
    description: 'Razorpay Payment ID',
    example: 'pay_FfWXTjsjVEgf5Q',
  })
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @ApiProperty({
    description: 'Razorpay Signature for verification',
    example: 'fa7b6c9c6f5e7fdef848febb41701ddfa05d2c59e2309087a74624f010c524b0',
  })
  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;
}
