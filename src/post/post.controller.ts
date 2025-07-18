import {
  BadRequestException,
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
  UsePipes,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ZodValidationPipe } from 'src/common/pipes/zod-validator.pipe';
import {
  CreatePostSchema,
  UpdatePostSchema,
} from 'src/validators/post/post.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  // @UsePipes(new ZodValidationPipe(CreatePostSchema))
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
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Post creation data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async createPost(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const { title, content } = req.body;

    // ✅ Validate with Zod manually
    const parsed = CreatePostSchema.safeParse({ title, content });

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message));
    }

    return this.postService.createPost(
      title,
      content,
      req.user.sub,
      file?.filename,
    );

    // const image = file?.filename;

    // return this.postService.createPost(title, content, req.user.id, image);
  }

  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiResponse({ status: 200, description: 'List of Posts' })
  @Get()
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @ApiOperation({ summary: 'Get Post by Id' })
  @ApiParam({ name: 'id', required: true, description: 'Post Id' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Put(':id')
  // @UsePipes(new ZodValidationPipe(UpdatePostSchema))
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
  @ApiOperation({ summary: 'Update Post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Post Id',
  })
  @ApiBody({
    description: 'Post update data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiConsumes('multipart/form-data')
  async updatePost(
    @Param('id') id: string,
    @Body()
    body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { title, content } = body;

    const parsed = UpdatePostSchema.safeParse({ title, content });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message));
    }

    return this.postService.updatePost(id, title, content, file?.filename);
  }

  @ApiOperation({ summary: 'Delete Post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Post Id',
  })
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postService.deletePost(id);
  }
}
