import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  private createToken(userId: string, role: string) {
    const payload = { sub: userId, role };
    return { access_token: this.jwt.sign(payload) };
  }

  async register(
    name: string,
    email: string,
    password: string,
    image?: string,
  ) {
    const exists = await this.prisma.user.findUnique({ where: { email } });

    if (exists) throw new ConflictException('Email is already in use');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { name, email, password: hashed, image },
    });

    try {
      await this.mailService.sendWelcomeEmail(user.email, user.name);
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    return this.createToken(user.id, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(
        "User doesn't exist or Invalid credentials",
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createToken(user.id, user.role);
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return new UnauthorizedException('Email is not valid');
    }

    const payload = { sub: user.id, purpose: 'forgot-password' };
    const resetToken = this.jwt.sign(payload, { expiresIn: '1h' });

    const expire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpire: expire,
      },
    });

    await this.mailService.sendResetPasswordEmail(email, resetToken);

    return { message: 'If email was valid, a reset link sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;

    try {
      payload = await this.jwt.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        resetToken: token,
        resetTokenExpire: {
          gte: new Date(), // must not be expired
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update the password if user exists
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpire: null,
      },
    });

    return { message: 'Password has been resest successfully' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new UnauthorizedException('Old Password Should Match');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Old Password Is Incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // change Password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password Changed Successfully' };
  }
}
