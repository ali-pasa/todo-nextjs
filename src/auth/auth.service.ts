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
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async register(
    username: string,
    password: string,
    email: string,
    mobileno: string,
  ): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashed = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      username,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashed,
      email,
      mobileno,
    });

    try {
      return await this.usersRepo.save(user);
    } catch (error) {
      // type-safe cast for DB errors
      const err = error as { code?: string; detail?: string; message?: string };

      // PostgreSQL unique violation
      if (err.code === '23505') {
        if (err.detail?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        if (err.detail?.includes('mobileno')) {
          throw new ConflictException('Mobile number already exists');
        }
        if (err.detail?.includes('username')) {
          throw new ConflictException('Username already exists');
        }
        throw new ConflictException('User already exists');
      }

      // MySQL unique violation
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message?.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        if (err.message?.includes('mobileno')) {
          throw new ConflictException('Mobile number already exists');
        }
        if (err.message?.includes('username')) {
          throw new ConflictException('Username already exists');
        }
        throw new ConflictException('User already exists');
      }

      throw new InternalServerErrorException();
    }
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
