import { Controller, Post, Body, HttpCode, HttpStatus, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(@Body() dto: RegisterUserDto): Promise<{ data: string }> {
    return this.usersService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto): Promise<{ data: { token: string } }> {
    return this.usersService.login(dto);
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logout(): Promise<{ data: string }> {
    return this.usersService.logout();
  }
}
