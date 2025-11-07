import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connector, ConnectorDocument } from './schemas/connector.schema';
import { CreateConnectorDto } from './dto/create-connector.dto';
import { UpdateConnectorDto } from './dto/update-connector.dto';

@Injectable()
export class ConnectorsService {
  constructor(
    @InjectModel(Connector.name)
    private connectorModel: Model<ConnectorDocument>,
  ) {}

  //create connector
  async create(createConnectorDto: CreateConnectorDto): Promise<any> {
    try {
      const createdConnector = new this.connectorModel(createConnectorDto);
      const response = await createdConnector.save();
      return {
        success: true,
        message: 'Connector created successfully',
        data: response,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Connector already exists.');
      }
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException(
        error,
        'Error while creating connector. Try again',
      );
    }
  }

  //connectors list
  async findAll(): Promise<Connector[]> {
    return this.connectorModel.find().exec();
  }

  //get one connector
  async findOne(id: string): Promise<Connector> {
    const connector = await this.connectorModel.findById(id).exec();
    if (!connector) {
      throw new NotFoundException(`Connector ${id} not found`);
    }
    return connector;
  }

  //update connector
  async update(
    id: string,
    updateConnectorDto: UpdateConnectorDto,
  ): Promise<any> {
    const updated = await this.connectorModel.findByIdAndUpdate(
      id,
      updateConnectorDto,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException(`Connector ${id} not found`);
    }
    return {
      success: true,
      message: 'Connector updated successfully',
      data: updated,
    };
  }

  //delete connector
  async remove(id: string): Promise<void> {
    const deleted = await this.connectorModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Connector ${id} not found`);
    }

    async findByUser(userId: string): Promise<Connector[]> {
    return this.connectorModel
        .find({ userIds: { $in: [userId] } })
        .exec();
    }
}
