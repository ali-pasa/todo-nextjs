import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 👈 this makes UserRepository injectable
  providers: [UserService],
  exports: [UserService], // 👈 export if used in AuthModule
})
export class UserModule {}
