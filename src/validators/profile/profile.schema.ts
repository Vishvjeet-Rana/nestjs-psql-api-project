import { z } from 'zod';

// export const UpdateProfileSchema = z.object({
//   name: z
//     .string()
//     .min(5, { message: 'Name must be at least 5 characters long' })
//     .refine((val: string) => val !== 'string', {
//       message: 'Name cannot be "string"',
//     })
//     .optional(),

//   email: z
//     .string()
//     .email({ message: 'Invalid Email' }) // Zod v4: standalone, no need for .string()
//     .refine((val) => val !== 'string', {
//       message: 'Email cannot be "string"',
//     })
//     .optional(),
// });

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine((val) => val === undefined || val.length >= 5, {
      message: 'Name must be at least 5 characters long',
    }),

  email: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
    .refine(
      (val) => val === undefined || z.string().email().safeParse(val).success,
      { message: 'Invalid email format' },
    ),
});
