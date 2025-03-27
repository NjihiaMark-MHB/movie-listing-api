import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  email: text('email').unique(),
  password: text('password'),
  firstName: text('firstName'),
  lastName: text('lastName'),
  refreshToken: text('refreshToken'),
  userAvatar: text('userAvatar'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
