import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SENDGRID_HOST,
    port: Number(process.env.SENDGRID_PORT),
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  async sendMail(to: string, subject: string, html: string) {
    return this.transporter
      .sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
      })
      .then((info) => {
        console.log(`Email sent: ${info.messageId}`);
      })
      .catch((err) => {
        console.error(`❌ Email failed: ${err.message}`);
      });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `<h1>Welcome, ${name}!</h1><p>Thanks for joining us.</p>`;
    return this.sendMail(to, 'Welcome to Blog API of Nest.js', html);
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const html = `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset Password</a></p>`;

    return this.sendMail(to, 'Reset Your Password', html);
  }
}
