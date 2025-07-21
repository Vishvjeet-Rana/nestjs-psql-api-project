import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const updateUserSchema = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    verified: z.boolean().optional(),
  }),
};

export type UpdateUserDto = z.infer<typeof updateUserSchema.body>;

export class UpdateUserDtoSwagger {
  @ApiPropertyOptional({ description: 'John Updated' })
  name?: string;

  @ApiPropertyOptional({ description: 'updated@example.com' })
  email?: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'], description: 'ADMIN' })
  role?: 'USER' | 'ADMIN';

  @ApiPropertyOptional({ example: false })
  verified?: boolean;
}
