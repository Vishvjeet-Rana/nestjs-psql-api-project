import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  // create post service
  async createPost(
    title: string,
    content: string,
    authorId: string,
    image?: string,
  ): Promise<Post> {
    if (!title || !content)
      throw new NotFoundException(
        'Title and Content is required to create a post',
      );

    return this.prisma.post.create({
      data: {
        title,
        content,
        authorId,
        image,
      },
    });
  }

  // get all posts service
  async getAllPosts(): Promise<Post[]> {
    return this.prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // get post by id service
  async getPostById(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post not found');

    return post;
  }

  // update post service
  async updatePost(
    id: string,
    title?: string,
    content?: string,
    image?: string,
  ): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    //   50e5341a-291e-415b-8755-0d13b7de0606

    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.post.update({
      where: { id },
      data: {
        title: title !== 'string' ? title : undefined,
        content: content !== 'string' ? content : undefined,
        image,
      },
    });
  }

  async deletePost(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.post.delete({
      where: { id },
    });
  }
}
