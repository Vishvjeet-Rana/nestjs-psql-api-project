import {
  Post,
  Body,
  Controller,
  UseGuards,
  Get,
  Query,
  Param,
  Put,
  UsePipes,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validator.pipe';
import {
  CreateUserDto,
  CreateUserDtoSwagger,
  CreateUserSchema,
} from './dto/create-user.dto';
import { AdminGuard } from './guards/admin.guard';
import {
  FilterUsersQueryDto,
  FilterUsersQuerySchema,
} from './dto/filter-users.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import {
  UpdateUserDto,
  UpdateUserDtoSwagger,
  updateUserSchema,
} from './dto/update-user.dto';

@ApiTags('Admin')
@Controller('users')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // create user route
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @ApiBearerAuth('access-token') // ← ADDED THIS
  @ApiOperation({ summary: 'Create a new user *(Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiBody({ type: CreateUserDtoSwagger })
  async createUser(
    @Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserDto,
  ) {
    return this.adminService.createUser(body);
  }

  // get all users - ADD GUARDS IF AUTHENTICATION IS REQUIRED
  @Get()
  @ApiOperation({ summary: 'Get all users with optional filters' })
  @ApiResponse({ status: 200, description: 'List of users returned' })
  // If this endpoint requires authentication, add these lines:
  // @UseGuards(JwtAuthGuard) // or @UseGuards(JwtAuthGuard, AdminGuard)
  // @ApiBearerAuth('access-token')
  async getAllUsers(
    @Query(new ZodValidationPipe(FilterUsersQuerySchema))
    query: FilterUsersQueryDto,
  ) {
    return this.adminService.getAllUsers(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  @ApiBearerAuth('access-token') // ← This one was already correct
  @ApiOperation({ summary: 'Get a user by ID *(Admin only)' })
  @ApiResponse({ status: 200, description: 'User details returned' })
  @ApiParam({ name: 'id', type: 'string' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  @ApiBearerAuth('access-token') // ← This one was already correct
  @ApiOperation({ summary: 'Update a user by Id *(Admin only)' })
  @ApiResponse({ status: 201, description: 'User updated successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateUserDtoSwagger })
  // @UsePipes(new ZodValidationPipe(updateUserSchema.params))
  // @UsePipes(new ZodValidationPipe(updateUserSchema.body))
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema.body)) body: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, body);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token') // ← This one was already correct
  @ApiOperation({ summary: 'Delete a user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiParam({ name: 'id', type: String })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token') // ← This one was already correct
  @ApiOperation({ summary: 'Verify a user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User verified successfully' })
  @ApiParam({ name: 'id', type: String })
  async verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(id);
  }
}
