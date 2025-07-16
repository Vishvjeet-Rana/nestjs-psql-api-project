import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResgisterDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
