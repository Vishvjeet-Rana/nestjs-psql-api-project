import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'enter old password' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'enter new password' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
