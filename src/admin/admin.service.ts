import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private sendMail: MailService,
    private jwt: JwtService,
  ) {}

  async createUser(dto: CreateUserDto) {
    // 1. Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new BadRequestException('User already exists');

    // 2. if not then create new uesr
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        role: dto.role ?? 'USER',
        verified: false,
      },
    });

    // 3. generate reset token using jwt
    const resetToken = this.jwt.sign(
      { userId: newUser.id },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      },
    );

    const resetTokenExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // 4. store token + expiry in DB
    await this.prisma.user.update({
      where: { id: newUser.id },
      data: {
        resetToken,
        resetTokenExpire,
      },
    });

    // 5. send reset password email
    await this.sendMail.sendResetPasswordEmail(newUser.email, resetToken);

    // return response
    return {
      message:
        'User created successfully and email has been sent to reset password',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async getAllUsers(filter: { verified?: boolean }) {
    const whereClause =
      filter.verified !== undefined ? { verified: filter.verified } : {};

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // update user
  async updateUser(id: string, data: Partial<UpdateUserDto>) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updateUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async verifyUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { verified: true },
    });
  }
}
