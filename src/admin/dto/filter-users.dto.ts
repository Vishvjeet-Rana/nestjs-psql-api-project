import { z } from 'zod';

export const FilterUsersQuerySchema = z.object({
  verified: z
    .string()
    .optional()
    .transform((val) =>
      val === 'true' ? true : val === 'false' ? false : undefined,
    ),
});

export type FilterUsersQueryDto = z.infer<typeof FilterUsersQuerySchema>;
