import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '../../lib/prisma';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  // Find user by ID
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.excludePassword(user);
  }

  // Find user by email
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Get all users (admin only)
  async findAll() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.excludePassword(user));
  }

  // Update user
  async update(id: string, data: Partial<{
    username: string;
    email: string;
    image: string;
    verified: boolean;
    role: UserRole;
  }>) {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return this.excludePassword(user);
  }

  // Delete user
  async delete(id: string) {
    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  // Remove sensitive fields
  excludePassword(user: any) {
    const { password, accessToken, refreshToken, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }
}
