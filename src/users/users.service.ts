import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import * as schema from './schema';
import { hash } from 'bcryptjs';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateUserRequest } from './dto/create-user.request';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async createUser(user: CreateUserRequest) {
    try {
      const saltedUser = { ...user, password: await hash(user.password, 10) };
      await this.database.insert(schema.users).values(saltedUser);
    } catch (error) {
      console.error('Failed to create user:', {
        error: error.message,
        email: user.email,
        stack: error.stack,
      });

      if (error.code === '23505') {
        // PostgreSQL unique violation code
        throw new ConflictException('User with this email already exists');
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating user',
      );
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.database
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);
      if (!user[0]) {
        throw new NotFoundException('User not found');
      }
      return user[0];
    } catch (error) {
      console.error('Failed to fetch user:', {
        error: error.message,
        id,
        stack: error.stack,
      });
      if (error.code === '42P01') {
        // relation does not exist
        throw new InternalServerErrorException('Database configuration error');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.database
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (!user[0]) {
        throw new NotFoundException('User not found');
      }

      return user[0];
    } catch (error) {
      console.error('Failed to fetch user:', {
        error: error.message,
        email,
        stack: error.stack,
      });

      if (error.code === '42P01') {
        // relation does not exist
        throw new InternalServerErrorException('Database configuration error');
      }

      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getUsers() {
    try {
      const users = await this.database.select().from(schema.users);
      return users;
    } catch (error) {
      console.error('Failed to fetch users:', {
        error: error.message,
        stack: error.stack,
      });
      if (error.code === '42P01') {
        // relation does not exist
        throw new InternalServerErrorException('Database configuration error');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
