import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async createPost(
    @Body() body: { title: string; content: string },
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const { title, content } = body;
    const image = file?.filename;

    return this.postService.createPost(title, content, image, req.user.id);
  }

  @Get()
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async updatePost(
    @Param('id') id: string,
    @Body() body: { title: string; content: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { title, content } = body;
    return this.postService.updatePost(id, title, content, file?.filename);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: string) {
    return this.postService.deletePost(id);
  }
}
