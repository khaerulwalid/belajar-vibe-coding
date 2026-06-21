import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

  async login(dto: LoginUserDto): Promise<{ data: { token: string } }> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new HttpException(
        { error: 'Email atau password salah' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        { error: 'Email atau password salah' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new HttpException(
        { error: 'Email atau password salah' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      data: {
        token,
      },
    };
  }
}
