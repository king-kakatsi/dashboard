import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import prisma from '../../lib/prisma';
import { UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';
import { EmailTemplateUtil } from 'src/common/utils/emailTemplate.utils';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    private readonly mailService: MailerService,
    // private readonly emailService: EmailService,
  ) {}

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.excludePassword(user);
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.excludePassword(user));
  }

  /**
   * UPDATE METHOD - Now handles standBy fields
   */
  async update(
    id: string,
    data: Partial<{
      username: string;
      email: string;
      standByEmail: string;
      standByUsername: string;
      image: string;
      verified: boolean;
      role: UserRole;
      connectedServiceIds: string[];
      activeWidgetIds: string[];
    }>,
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle standByEmail
    if (data.standByEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.standByEmail },
      });
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email already in use');
      }

      await prisma.user.update({
        where: { id },
        data: { standByEmail: data.standByEmail },
      });

      await this.sendUpdateConfirmationEmail(
        user.username,
        user.email,
        id,
        data.standByEmail,
        undefined,
      );

      return { message: 'Confirmation email sent. Please check your inbox.' };
    }

    // Regular update for other fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        image: data.image,
        verified: data.verified,
        role: data.role,
        connectedServiceIds: data.connectedServiceIds,
        activeWidgetIds: data.activeWidgetIds,
      },
    });

    return this.excludePassword(updatedUser);
  }

  /**
   * NEW METHOD - Confirm update by applying standBy values
   */
  async confirmUpdate(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    if (user.standByEmail) {
      updateData.email = user.standByEmail;
      updateData.standByEmail = null;
    }

    if (user.standByUsername) {
      updateData.username = user.standByUsername;
      updateData.standByUsername = null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new NotFoundException('No pending updates found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      message: 'Account updated successfully',
      user: this.excludePassword(updatedUser),
    };
  }

  /**
   * PRIVATE HELPER - Send confirmation email
   */
  private async sendUpdateConfirmationEmail(
    username: string,
    currentEmail: string,
    userId: string,
    newEmail?: string,
    newUsername?: string,
  ) {
    // Local fallback so the mailed link is never "undefined/...".
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmationLink = `${frontendBaseUrl}/confirm-update/${userId}`;

    const emailHtml = EmailTemplateUtil.getUpdateConfirmationEmail(
      username,
      confirmationLink,
      newEmail,
      newUsername,
    );

    return this.mailService.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: currentEmail,
      subject: 'Confirm Your Account Update - Dashboard',
      html: emailHtml,
    });
  }

  async delete(id: string) {
    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async addConnectedService(userId: string, serviceId: string) {
    const user = await this.findById(userId);

    if (user.connectedServiceIds.includes(serviceId)) {
      return user;
    }

    return this.update(userId, {
      connectedServiceIds: [...user.connectedServiceIds, serviceId],
    });
  }

  async removeConnectedService(userId: string, serviceId: string) {
    const user = await this.findById(userId);

    return this.update(userId, {
      connectedServiceIds: user.connectedServiceIds.filter(
        (id) => id !== serviceId,
      ),
    });
  }

  async addActiveWidget(userId: string, widgetId: string) {
    const user = await this.findById(userId);

    if (user.activeWidgetIds.includes(widgetId)) {
      return user;
    }

    return this.update(userId, {
      activeWidgetIds: [...user.activeWidgetIds, widgetId],
    });
  }

  async removeActiveWidget(userId: string, widgetId: string) {
    const user = await this.findById(userId);

    return this.update(userId, {
      activeWidgetIds: user.activeWidgetIds.filter((id) => id !== widgetId),
    });
  }

  private excludePassword(user: any) {
    const { password, accessToken, refreshToken, ...userWithoutSensitive } =
      user;
    return userWithoutSensitive;
  }
}
