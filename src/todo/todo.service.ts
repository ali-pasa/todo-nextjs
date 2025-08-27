import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  // Create todo (attach user)
  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      user: { id: userId }, // attach authenticated user
    });
    return await this.todoRepository.save(todo);
  }

  // Find all todos (admins see all, users see own)
  async findAll(user: any): Promise<Todo[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user.role === 'admin') {
      return await this.todoRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    return await this.todoRepository.find({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      where: { user: { id: user.userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Find one todo (check ownership if not admin)
  async findOne(id: number, user: any): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user.role !== 'admin' && todo.user.id !== user.userId) {
      throw new ForbiddenException('You are not allowed to access this todo');
    }
    return todo;
  }

  // Update todo (ownership check)
  async update(
    id: number,
    updateTodoDto: UpdateTodoDto,
    user: any,
  ): Promise<Todo> {
    const todo = await this.findOne(id, user);
    Object.assign(todo, updateTodoDto);
    return await this.todoRepository.save(todo);
  }

  // Remove todo (ownership check)
  async remove(id: number, user: any): Promise<void> {
    const todo = await this.findOne(id, user);
    await this.todoRepository.remove(todo);
  }

  // Toggle completion (ownership check)
  async toggleComplete(id: number, user: any): Promise<Todo> {
    const todo = await this.findOne(id, user);
    todo.completed = !todo.completed;
    return await this.todoRepository.save(todo);
  }
}
