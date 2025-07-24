import {
  Body,
  Post,
  Get,
  Req,
  Controller,
  UseGuards,
  Param,
  UsePipes,
  BadRequestException,
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
import { ZodValidationPipe } from 'src/common/pipes/zod-validator.pipe';
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  GetMeSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from 'src/validators/auth/auth.schema';

@ApiTags('Auth') // this will gorup routed under "Auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  // @UsePipes(new ZodValidationPipe(RegisterSchema))
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
  async register(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const image = file?.filename; // or `null` if not uploaded

    const dto = {
      name: body.name,
      email: body.email,
      password: body.password,
    };

    // ✅ Now validate manually using Zod
    const parsed = RegisterSchema.safeParse(dto);

    console.log('💬 BODY:', body);
    console.log('📸 FILE:', file);

    if (!parsed.success) {
      // Optional: format errors
      throw new BadRequestException(parsed.error.format());
    }

    return this.authService.register(dto.name, dto.email, dto.password, image);
  }

  @ApiOperation({ summary: 'login and get access token' })
  @UsePipes(new ZodValidationPipe(LoginSchema))
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

  @UsePipes(new ZodValidationPipe(GetMeSchema))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub);
  }

  @ApiOperation({ summary: 'Send forgot password reset link to user email' })
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  @ApiBody({ type: ForgotPasswordDto })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password using token from email link' })
  // @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  @ApiParam({ name: 'token', description: 'Reset token from email link' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: {
          type: 'string',
          description: 'Enter new password',
          minLength: 8,
        },
      },
      required: ['newPassword'], // ← ensures Swagger enforces presence
    },
  })
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, dto.newPassword);
  }

  @ApiOperation({ summary: 'Change password for authenticated user' })
  @UsePipes(new ZodValidationPipe(ChangePasswordSchema))
  @ApiBody({ type: ChangePasswordDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
