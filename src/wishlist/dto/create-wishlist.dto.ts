import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsDecimal, IsNumber } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty({
    description: 'ID of the product item being added to the wishlist',
    example: 123,
  })
  @IsInt()
  productItemId: number;

//   @ApiProperty({
//     description: 'Quantity of the product item being added',
//     example: 2,
//   })
//   @IsInt()
//   @IsPositive()
//   quantity: number;

  @ApiProperty({
    description: 'Price of the product item at the time of addition',
    example: 29.99,
  })
  @IsNumber()
  priceAtTime: number;
}
