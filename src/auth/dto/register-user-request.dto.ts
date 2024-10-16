import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  // IsStrongPassword,
} from 'class-validator';

export class RegisterUserRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  dialCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  mobile?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  country: string;

  // @ApiPropertyOptional()
  // @IsString()
  // @IsOptional()
  // emailVerificationCode: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // mobileVerificationCode?: string;
}
