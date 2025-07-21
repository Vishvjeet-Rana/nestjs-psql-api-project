import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email({ message: 'Invalid email' }),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

// this line is key to connecting Zod runtime validation with TypeScript static types.
export type CreateUserDto = z.infer<typeof CreateUserSchema>;

//  Class for Swagger docs only
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDtoSwagger {
  @ApiProperty({ description: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'john@example.com' })
  email: string;

  @ApiProperty({
    description: 'USER',
    required: false,
    enum: ['USER', 'ADMIN'],
  })
  role?: 'USER' | 'ADMIN';
}
