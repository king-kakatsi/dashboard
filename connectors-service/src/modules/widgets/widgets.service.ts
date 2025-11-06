import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Widget, WidgetDocument } from './schemas/widgets.schema';
import { CreateWidgetDto } from './dto/create-widgets.dto';
import { UpdateWidgetDto } from './dto/update-widgets.dto';

@Injectable()
export class WidgetsService {
  constructor(
    @InjectModel(Widget.name)
    private readonly widgetModel: Model<WidgetDocument>,
  ) { }

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

  // ⚙️ Mettre à jour la position d’un widget pour un utilisateur donné
  async updateUserPosition(widgetId: string, userId: string, position: { x: number; y: number }) {
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

  // 🔍 Récupérer les widgets d’un utilisateur
  async findByUser(userId: string): Promise<Widget[]> {
    return this.widgetModel
      .find({ userIds: userId })
      .populate('serviceId')
      .exec();
  }

  //find service
  async findByService(serviceId: string): Promise<Widget[]> {
    return this.widgetModel.find({ serviceId }).exec();
  }

}
