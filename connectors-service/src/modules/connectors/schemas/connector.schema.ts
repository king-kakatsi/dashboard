import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConnectorDocument = Connector & Document;
@Schema({
    timestamps: true,
})
export class Connector {
    @Prop({ unique: true, required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ unique: true, required: true })
    icon: string;

    @Prop({ unique: true })
    baseUrl: string;
}

export const ConnectorSchema = SchemaFactory.createForClass(Connector);
