import { UnauthorizedException } from '@nestjs/common';
import prisma from 'lib/prisma';
import { JwtStrategy } from './jwt.strategy';

jest.mock('lib/prisma', () => ({
  __esModule: true,
  default: { user: { findUnique: jest.fn() } },
}));

const mockPrismaUser = (prisma as any).user;

describe('JwtStrategy', () => {
  function strategy() {
    return new JwtStrategy({ get: jest.fn(() => 'test-secret') } as any);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps a known user payload', async () => {
    mockPrismaUser.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@test',
      username: 'tester',
      role: 'USER',
      provider: 'LOCAL',
    });

    await expect(strategy().validate({ userId: 'u1' })).resolves.toEqual({
      id: 'u1',
      email: 'user@test',
      username: 'tester',
      role: 'USER',
      provider: 'LOCAL',
    });
  });

  it('rejects an unknown user', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null);
    await expect(
      strategy().validate({ userId: 'ghost' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
