import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { TodoModule } from './todo/todo.module';
// import { Todo } from './todo/todo.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'admin_user',
      password: process.env.DB_PASSWORD || 'Admin@$786',
      database: process.env.DB_NAME || 'todo_db',
      // entities: [Todo],
      autoLoadEntities: true,
      logging: true,
      synchronize: process.env.MODE === 'DEV', // ❌ don't use in production
    }),
    RouterModule.register([
      {
        path: 'api/v1',
        children: [
          { path: 'todos', module: TodoModule },
          { path: 'users', module: UserModule },
        ],
      },
    ]),
    TodoModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
