import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // corrected filename
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, mobileno, password } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      username,
      email,
      mobileno,
      password: hashedPassword,
    });

    try {
      return await this.usersRepo.save(user);
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

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
