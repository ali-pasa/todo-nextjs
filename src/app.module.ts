import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from './todo/todo.module';
import { Todo } from './todo/todo.entity';

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
      entities: [Todo],
      autoLoadEntities: true,
      logging: false,
      synchronize: true, // ❌ not for production, good for dev
    }),
    TodoModule,
  ],
})
export class AppModule {}
