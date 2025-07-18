import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ProfileService } from './profile/profile.service';
import { ProfileModule } from './profile/profile.module';
import { ProfileController } from './profile/profile.controller';
import { PostModule } from './post/post.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule, ProfileModule, PostModule],
  controllers: [AppController, ProfileController],
  providers: [AppService, MailService, ProfileService],
  exports: [MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // apply globally
  }
}
