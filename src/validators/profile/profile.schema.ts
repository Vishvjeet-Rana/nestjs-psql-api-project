import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long' })
    .refine((val: string) => val !== 'string', {
      message: 'Name cannot be "string"',
    })
    .optional(),

  email: z
    .string()
    .email({ message: 'Invalid Email' }) // Zod v4: standalone, no need for .string()
    .refine((val) => val !== 'string', {
      message: 'Email cannot be "string"',
    })
    .optional(),
});
