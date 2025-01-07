import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import * as schema from './schema';
import { hash } from 'bcryptjs';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateUserRequest } from './dto/create-user.request';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async createUser(user: CreateUserRequest) {
    const saltedUser = { ...user, password: await hash(user.password, 10) };
    await this.database.insert(schema.users).values(saltedUser);
  }
}
