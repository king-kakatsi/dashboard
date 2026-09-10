import { UpdateUserDto as CreateUserDto } from './users/dto/create-user.dto';
import { UpdateUserDto } from './users/dto/update-user.dto';
import { UserResponseDto } from './users/dto/user-response.dto';
import { AuthResponseDto } from './auth/dto/auth-response.dto';

describe('DTO definitions', () => {
  it('exposes user and auth shapes', () => {
    expect(new CreateUserDto()).toBeDefined();
    expect(new UpdateUserDto()).toBeDefined();
    expect(new UserResponseDto()).toBeDefined();
    expect(new AuthResponseDto()).toBeDefined();
  });
});
