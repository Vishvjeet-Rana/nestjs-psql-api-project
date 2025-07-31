import {
  BadRequestException,
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

  // register user service
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

  // login user service
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('This email is not registered');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Incorrect password');
    }

    return this.createToken(user.id, user.role);
  }

  // get current user profile
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
    console.log('🔍 Forgot Password - Email received:', email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('❌ User not found with email:', email);
      return { message: 'If email was valid, a reset link sent to your email' };
    }

    console.log('✅ User found:', { id: user.id, email: user.email });

    const payload = { sub: user.id, purpose: 'forgot-password' };
    const resetToken = this.jwt.sign(payload, { expiresIn: '1h' });

    console.log('🔍 Reset token generated:', resetToken);
    console.log('🔍 Token payload:', payload);

    const expire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    console.log('🔍 Token expiry time:', expire);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpire: expire,
      },
    });

    console.log(
      '✅ Reset token saved to database for user:',
      updatedUser.email,
    );

    try {
      await this.mailService.sendResetPasswordEmail(email, resetToken);
      console.log('✅ Reset email sent successfully to:', email);
    } catch (error) {
      console.log('❌ Email sending failed:', error.message);
    }

    return { message: 'If email was valid, a reset link sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {
    console.log('🔍 Reset Password - Token received:', token);
    console.log('🔍 Reset Password - New password received:', newPassword);

    let payload: any;

    try {
      // Remove await - jwt.verify is synchronous
      payload = this.jwt.verify(token);
      console.log('✅ Token verified successfully:', payload);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    console.log('🔍 Looking for user with ID:', payload.sub);
    console.log('🔍 Looking for user with token:', token);

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        resetToken: token,
        resetTokenExpire: {
          gte: new Date(), // must not be expired
        },
      },
    });

    console.log('🔍 User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('🔍 User details:', {
        id: user.id,
        email: user.email,
        resetToken: user.resetToken,
        resetTokenExpire: user.resetTokenExpire,
        currentTime: new Date(),
      });
    }

    if (!user) {
      console.log('❌ User not found or token expired');
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔍 New password hashed successfully');

    // update the password if user exists
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpire: null,
      },
    });

    console.log(
      '✅ Password updated successfully for user:',
      updatedUser.email,
    );
    return { message: 'Password has been reset successfully' };
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
