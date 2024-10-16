import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Amount for the order in INR',
    example: 500,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Unique identifier for the receipt',
    example: 'receipt#1',
  })
  @IsString()
  @IsNotEmpty()
  receipt: string;
}
