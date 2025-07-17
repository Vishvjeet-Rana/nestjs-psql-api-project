import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'enter new password' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
