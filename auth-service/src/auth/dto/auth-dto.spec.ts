import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';

function validRegistration() {
  return {
    email: 'user@example.com',
    username: 'testuser',
    password: 'Strong1!',
    passwordConfirmation: 'Strong1!',
  };
}

describe('RegisterDto validation', () => {
  it('accepts a valid registration payload', async () => {
    const registration = plainToInstance(RegisterDto, validRegistration());
    await expect(validate(registration)).resolves.toEqual([]);
  });

  it('rejects an invalid email', async () => {
    const registration = plainToInstance(RegisterDto, {
      ...validRegistration(),
      email: 'not-an-email',
    });
    const errors = await validate(registration);
    expect(
      errors.some((validationError) => validationError.property === 'email'),
    ).toBe(true);
  });

  it('rejects a short username', async () => {
    const registration = plainToInstance(RegisterDto, {
      ...validRegistration(),
      username: 'ab',
    });
    const errors = await validate(registration);
    expect(
      errors.some((validationError) => validationError.property === 'username'),
    ).toBe(true);
  });

  it('rejects a weak password without uppercase, digit or symbol', async () => {
    const registration = plainToInstance(RegisterDto, {
      ...validRegistration(),
      password: 'weakpassword',
      passwordConfirmation: 'weakpassword',
    });
    const errors = await validate(registration);
    expect(
      errors.some((validationError) => validationError.property === 'password'),
    ).toBe(true);
    expect(
      errors.some(
        (validationError) =>
          validationError.property === 'passwordConfirmation',
      ),
    ).toBe(true);
  });

  it('rejects a short password', async () => {
    const registration = plainToInstance(RegisterDto, {
      ...validRegistration(),
      password: 'Aa1!',
      passwordConfirmation: 'Aa1!',
    });
    const errors = await validate(registration);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects missing fields', async () => {
    const errors = await validate(plainToInstance(RegisterDto, {}));
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('LoginDto validation', () => {
  it('accepts a valid login payload', async () => {
    const loginAttempt = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: 'anything',
    });
    await expect(validate(loginAttempt)).resolves.toEqual([]);
  });

  it('rejects an invalid email', async () => {
    const loginAttempt = plainToInstance(LoginDto, {
      email: 'not-an-email',
      password: 'anything',
    });
    const errors = await validate(loginAttempt);
    expect(
      errors.some((validationError) => validationError.property === 'email'),
    ).toBe(true);
  });

  it('rejects a missing password', async () => {
    const loginAttempt = plainToInstance(LoginDto, {
      email: 'user@example.com',
    });
    const errors = await validate(loginAttempt);
    expect(
      errors.some((validationError) => validationError.property === 'password'),
    ).toBe(true);
  });
});
