import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, { message: 'Name must be at least 5 characters long.' }),

  email: z.string().trim().email({ message: 'Invalid email format' }),

  password: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export const LoginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email format' }),

  password: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email format' }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().trim(),

  newPassword: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export const ChangePasswordSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID Format' }),

  oldPassword: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' }),

  newPassword: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});
