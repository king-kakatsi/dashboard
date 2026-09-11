import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Widget, WidgetDocument } from './schemas/widgets.schema';
import { CreateWidgetDto } from './dto/create-widgets.dto';
import { UpdateWidgetDto } from './dto/update-widgets.dto';
import axios from 'axios';

@Injectable()
export class WidgetsService {
  constructor(
    @InjectModel(Widget.name)
    private readonly widgetModel: Model<WidgetDocument>,
  ) {}

  async create(dto: CreateWidgetDto): Promise<Widget> {
    const widget = new this.widgetModel(dto);
    return widget.save();
  }

  async findAll(): Promise<Widget[]> {
    return this.widgetModel.find().populate('serviceId').exec();
  }

  async findOne(id: string): Promise<Widget> {
    const widget = await this.widgetModel
      .findById(id)
      .populate('serviceId')
      .exec();

    if (!widget) throw new NotFoundException('Widget not found');
    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto): Promise<Widget> {
    const updated = await this.widgetModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Widget not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.widgetModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Widget not found');
  }

  // Update the position of a widget for a given user
  /**
   * Moves one user's widget on their board.
   *
   * Updates the stored position when the user already has one, otherwise
   * appends a new entry. The user id must be a valid ObjectId: anything
   * else fails inside the cast, not in this method.
   */
  async updateUserPosition(
    widgetId: string,
    userId: string,
    position: { x: number; y: number },
  ) {
    const widget = await this.widgetModel.findById(widgetId);
    if (!widget) throw new NotFoundException('Widget not found');

    const existing = widget.positions.find(
      (p: { user_id: { toString: () => string } }) =>
        p.user_id.toString() === userId,
    );

    if (existing) {
      existing.position = position;
    } else {
      widget.positions.push({
        user_id: new Types.ObjectId(userId),
        position,
      });
    }

    await widget.save();
    return widget;
  }

  // Get all widgets of a user
  async findByUser(userId: string): Promise<Widget[]> {
    return this.widgetModel
      .find({ userIds: { $in: [userId] } })
      .populate('serviceId')
      .exec();
  }

  // Find widgets by connector (service)
  async findByService(serviceId: string): Promise<Widget[]> {
    return this.widgetModel.find({ serviceId }).exec();
  }

  async activateForUser(widgetId: string, userId: string): Promise<Widget> {
    const widget = await this.widgetModel.findById(widgetId);
    if (!widget) throw new NotFoundException('Widget not found');

    if (!widget.userIds.includes(userId)) {
      widget.userIds.push(userId);
      await widget.save();
    }

    return widget;
  }

  async deactivateForUser(widgetId: string, userId: string): Promise<Widget> {
    const widget = await this.widgetModel.findById(widgetId);
    if (!widget) throw new NotFoundException('Widget not found');

    widget.userIds = widget.userIds.filter((id) => id !== userId);
    await widget.save();

    return widget;
  }

  /**
   * Calls the third-party API behind a widget and wraps the answer.
   *
   * Joins the connector baseUrl with the widget endpoint plus caller params,
   * with a 15-second timeout. Returns a success envelope carrying the data
   * and widget identity.
   *
   * @param widgetId Widget whose connector holds the baseUrl
   * @param additionalParams Extra query values, like a city or topic
   * @throws {NotFoundException} When the widget or its connector is missing
   * @throws {InternalServerErrorException} When the outside API fails or is slow
   */
  async fetchWidgetData(
    widgetId: string,
    additionalParams: Record<string, any> = {},
  ): Promise<any> {
    try {
      // Get widget
      const widget = await this.widgetModel
        .findById(widgetId)
        .populate('serviceId')
        .exec();

      if (!widget) {
        throw new NotFoundException('Widget not found');
      }

      // Check if service exists
      const connector = widget.serviceId as any;
      if (!connector || !connector.baseUrl) {
        throw new NotFoundException('Connector not found or invalid');
      }
      let fullUrl = `${connector.baseUrl}${widget.endpoint || ''}`;

      // add additional params
      if (Object.keys(additionalParams).length > 0) {
        const params = new URLSearchParams(additionalParams as any);
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl = `${fullUrl}${separator}${params.toString()}`;
      }

      // Send request to third party service
      const response = await axios.get(fullUrl, {
        timeout: 15000,
      });
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          widget: {
            id: widget._id,
            name: widget.name,
          },
        };
      }

      throw new InternalServerErrorException(
        'Failed to fetch data from external API',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch data from external API',
      );
    }
  }
}
