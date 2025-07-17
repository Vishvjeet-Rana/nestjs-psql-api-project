import {
  Body,
  Post,
  Get,
  Req,
  Controller,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth-guard';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Auth') // this will gorup routed under "Auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Enter your name' },
        email: {
          type: 'string',

          description: 'Enter your email',
        },
        password: {
          type: 'string',
          description: 'Enter a secure password',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: RegisterDto,
  ) {
    const image = file?.filename; // or `null` if not uploaded
    return this.authService.register(dto.name, dto.email, dto.password, image);
  }

  @ApiOperation({ summary: 'login and get access token' })
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Enter your email' },
        password: { type: 'string', description: 'Enter Password' },
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.userId);
  }

  @ApiOperation({ summary: 'Send forgot password reset link to user email' })
  @ApiBody({ type: ForgotPasswordDto })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password using token from email link' })
  @ApiParam({ name: 'token', description: 'Reset token from email link' })
  @ApiBody({ type: ResetPasswordDto })
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, dto.newPassword);
  }

  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
