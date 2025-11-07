import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WidgetDocument = Widget & Document;

@Schema({ timestamps: true })
export class Widget {
  // userIds: Types.ObjectId[];
  // @Prop({ unique: true })
  @Prop({ type: [String], index: true })
  userIds: string[];

  @Prop({ type: Types.ObjectId, ref: 'Connector', required: true })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  functionName: string;

  @Prop({ unique: true, required: true })
  icon: string;

  @Prop()
  endpoint: string;

  @Prop({ default: 300 })
  refreshRate: number;

  @Prop({
    type: [
      {
        user_id: { type: Types.ObjectId, ref: 'User' },
        position: { x: Number, y: Number },
      },
    ],
    default: [],
  })
  positions: { user_id: Types.ObjectId; position: { x: number; y: number } }[];
}

export const WidgetSchema = SchemaFactory.createForClass(Widget);
