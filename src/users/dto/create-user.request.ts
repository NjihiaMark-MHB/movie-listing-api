import { IsEmail, IsStrongPassword } from 'class-validator';

export class CreateUserRequest {
  @IsEmail(undefined, {
    message: 'Invalid email',
  })
  email: string;

  @IsStrongPassword(undefined, {
    message:
      'Password must be at least 8 characters long, and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
  })
  password: string;

  firstName: string;
  lastName: string;
}
