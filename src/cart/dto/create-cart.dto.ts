import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCartDto {
    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    productItemId: number;
  
    @ApiProperty()
    @IsInt()
    @IsPositive()
    quantity: number;
  
    @ApiProperty()
    @IsPositive()
    priceAtTime: number; 
}
