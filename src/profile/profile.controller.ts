import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validator.pipe';
import { UpdateProfileSchema } from 'src/validators/profile/profile.schema';

@Controller('profile')
@ApiTags('Profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get()
  async getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.sub);
  }

  @ApiOperation({ summary: 'Update profile name or email' })
  @ApiBody({ type: UpdateProfileDto })
  @Put()
  @UsePipes(new ZodValidationPipe(UpdateProfileSchema))
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Upload a new profile picture' })
  @Put('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadProfilePicture(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.uploadProfilePicture(
      req.user.sub,
      file.filename,
    );
  }
}
