// src/todo/todo.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('todos') // 👈 give a proper route prefix
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.todoService.create(createTodoDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.todoService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.todoService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @Req() req,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.todoService.update(id, updateTodoDto, req.user);
  }

  @Patch(':id/toggle')
  toggleComplete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.todoService.toggleComplete(id, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.todoService.remove(id, req.user);
  }
}
