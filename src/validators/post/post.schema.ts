import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters long'),

  content: z
    .string({ required_error: 'Content is required' })
    .min(10, 'Content must be at least 10 characters long'),
});

export const UpdatePostSchema = z.object({
  title: z.string().optional(),

  content: z.string().optional(),
});
