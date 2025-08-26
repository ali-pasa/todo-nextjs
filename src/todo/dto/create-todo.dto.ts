import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTodoDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MaxLength(255)
  title: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  description?: string;
}
