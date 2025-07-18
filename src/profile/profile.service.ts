import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) throw new NotFoundException('User Not Found');

    const name = dto.name === 'string' ? existingUser.name : dto.name;
    const email = dto.email === 'string' ? existingUser.email : dto.email;

    return this.prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });
  }

  async uploadProfilePicture(userId: string, imageName: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { image: imageName },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });
  }
}
