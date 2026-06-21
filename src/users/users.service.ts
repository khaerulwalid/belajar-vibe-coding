import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterUserDto): Promise<{ data: string }> {
    const { name, email, password } = dto;

    if (!name || !email || !password) {
      throw new HttpException(
        { error: 'Name, email, and password are required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if email already registered
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        { error: 'Email sudah terdaftar' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return { data: 'Ok' };
  }
}
