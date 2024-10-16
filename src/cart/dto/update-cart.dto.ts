import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemQuantityDto {

  @ApiProperty({
    description: 'The new quantity of the item',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  quantity: number;
}
