import { Controller, Body, Post, Get, UseGuards, Param } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: CreateUserRequest) {
    return this.usersService.createUser(request);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Get('uuid/:uuid')
  @UseGuards(JwtAuthGuard)
  async getUserbyUUID(@Param('uuid') userId: string) {
    return this.usersService.getUserByUUId(userId);
  }
}
