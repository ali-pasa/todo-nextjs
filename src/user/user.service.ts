import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  /** ✅ Create new user with duplicate validation */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, mobileno, password } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.repo.create({
      username,
      email,
      mobileno,
      password: hashedPassword,
    });

    try {
      return await this.repo.save(user);
    } catch (error: any) {
      // PostgreSQL unique violation
      if (error.code === '23505') {
        if (error.detail?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        if (error.detail?.includes('mobileno')) {
          throw new ConflictException('Mobile number already exists');
        }
        if (error.detail?.includes('username')) {
          throw new ConflictException('Username already exists');
        }
        throw new ConflictException('User already exists');
      }

      // MySQL unique violation
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        if (error.message?.includes('mobileno')) {
          throw new ConflictException('Mobile number already exists');
        }
        if (error.message?.includes('username')) {
          throw new ConflictException('Username already exists');
        }
        throw new ConflictException('User already exists');
      }

      throw new InternalServerErrorException('Unexpected error creating user');
    }
  }

  /** ✅ Get all users */
  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  /** ✅ Get one user by ID */
  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  /** ✅ Update user */
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  /** ✅ Delete user */
  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
