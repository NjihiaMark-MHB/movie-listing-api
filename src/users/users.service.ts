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
import { UpdateUserRequest } from './dto/update-user.request';

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
        .select({
          id: schema.users.id,
          email: schema.users.email,
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          refreshToken: schema.users.refreshToken,
        })
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

  async updateUser(id: number, updateData: Partial<UpdateUserRequest>) {
    try {
      // If password is included, hash it
      if (updateData.password) {
        updateData.password = await hash(updateData.password, 10);
      }

      const updatedUser = await this.database
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, id))
        .returning();

      if (!updatedUser[0]) {
        throw new NotFoundException('User not found');
      }

      return updatedUser[0];
    } catch (error) {
      console.error('Failed to update user:', {
        error: error.message,
        id,
        stack: error.stack,
      });

      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }

      if (error.code === '42P01') {
        throw new InternalServerErrorException('Database configuration error');
      }

      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getOrCreateUser(user: CreateUserRequest) {
    try {
      const existingUser = await this.getUserByEmail(user.email);
      if (existingUser) {
        return existingUser;
      } else {
        await this.createUser(user);
        return this.getUserByEmail(user.email);
      }
    } catch (error) {
      console.error('Failed to get or create user:', {
        error: error.message,
        email: user.email,
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'An unexpected error occurred while getting or creating user',
      );
    }
  }
}
