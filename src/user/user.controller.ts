import {
  Controller,
  Get,
  Req,
  UseGuards,
  Param,
  Put,
  Delete,
  Body,
  ForbiddenException,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user-dto';

@UseGuards(JwtAuthGuard)
@Controller('users') // 👈 RouterModule already mounts at /api/v1/users
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Create new user (Admin only)
  @Post()
  async create(@Req() req, @Body() dto: CreateUserDto) {
    console.log('User Role: ', req.user.role);
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create new users');
    }
    return this.userService.create(dto);
  }

  // ✅ Logged-in user profile
  @Get('profile')
  getProfile(@Req() req) {
    console.log('User Role: ', req.user);
    return req.user;
  }

  // ✅ Get all users (admin only)
  @Get()
  async getAll(@Req() req) {
    console.log('User Role: ', req.user);
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view all users');
    }
    return this.userService.findAll();
  }

  // ✅ Protect this route
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string, @Req() req) {
    console.log('User Role: ', req.user);
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      throw new ForbiddenException('You can only access your own data');
    }
    return this.userService.findOne(+id);
  }

  // ✅ Update own profile
  @Put('profile')
  async updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.userService.update(req.user.id, dto);
  }

  // ✅ Delete user (admin only)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }
    return this.userService.remove(+id);
  }
}
