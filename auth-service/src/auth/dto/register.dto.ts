import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

// One shared rule: 8+ chars with upper, lower, digit and symbol.
// Used by both password fields so they can never disagree.
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const strongPasswordMessage =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(strongPasswordPattern, {
    message: strongPasswordMessage,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(strongPasswordPattern, {
    message: strongPasswordMessage,
  })
  passwordConfirmation: string;

  @IsString()
  @IsOptional()
  image?: string;
}
