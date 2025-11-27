import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    try {
      return await this.taskRepository.find();
    } catch (err) {
      throw new InternalServerErrorException('Erro ao buscar tasks');
    }
  }

  async findOne(id: number): Promise<Task> {
    try {
      const task = await this.taskRepository.findOne({ where: { id } });
      if (!task) throw new NotFoundException(`Task com id ${id} não encontrada`);
      return task;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Erro ao buscar task');
    }
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const task = this.taskRepository.create(createTaskDto as Partial<Task>);
      return await this.taskRepository.save(task);
    } catch (err) {
      throw new BadRequestException('Dados inválidos ao criar task');
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      const task = await this.findOne(id);
      Object.assign(task, updateTaskDto);
      return await this.taskRepository.save(task);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException('Erro ao atualizar task');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const task = await this.findOne(id);
      await this.taskRepository.remove(task);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Erro ao remover task');
    }
  }
}
