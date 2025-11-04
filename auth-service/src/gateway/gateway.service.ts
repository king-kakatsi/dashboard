// src/gateway/gateway.service.ts
import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly connectorsClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    // Get connectors service URL from .env or use default
    const connectorsUrl = this.configService.get<string>(
      'CONNECTORS_SERVICE_URL',
      'http://localhost:3001',
    );

    // Create HTTP client for connectors-service
    this.connectorsClient = axios.create({
      baseURL: connectorsUrl,
      timeout: 10000,
    });
  }

  // Forward request to connectors-service
  private async forwardRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    userId: string,
    data?: any,
  ): Promise<T> {
    try {
      const config = {
        headers: { 'X-User-Id': userId }, // Send user ID to connectors-service
      };

      let response;
      if (method === 'get') {
        response = await this.connectorsClient.get(path, config);
      } else if (method === 'post') {
        response = await this.connectorsClient.post(path, data, config);
      } else if (method === 'put') {
        response = await this.connectorsClient.put(path, data, config);
      } else if (method === 'delete') {
        response = await this.connectorsClient.delete(path, config);
      }

      return response.data;
    } catch (error) {
      // Handle errors from connectors-service
      if (error.response) {
        this.logger.error(`Connectors service error: ${error.response.status}`);
        throw new HttpException(
          error.response.data?.message || 'Error from connectors service',
          error.response.status,
        );
      } else {
        this.logger.error('Cannot reach connectors service');
        throw new HttpException('Service unavailable', 503);
      }
    }
  }

  // ===== Connectors Methods =====
  getConnectors(userId: string) {
    return this.forwardRequest('get', '/connectors', userId);
  }

  getConnector(connectorId: string, userId: string) {
    return this.forwardRequest('get', `/connectors/${connectorId}`, userId);
  }

  createConnector(data: any, userId: string) {
    return this.forwardRequest('post', '/connectors', userId, data);
  }

  updateConnector(connectorId: string, data: any, userId: string) {
    return this.forwardRequest(
      'put',
      `/connectors/${connectorId}`,
      userId,
      data,
    );
  }

  deleteConnector(connectorId: string, userId: string) {
    return this.forwardRequest('delete', `/connectors/${connectorId}`, userId);
  }

  // ===== Widgets Methods =====
  getWidgets(userId: string) {
    return this.forwardRequest('get', '/widgets', userId);
  }

  getWidget(widgetId: string, userId: string) {
    return this.forwardRequest('get', `/widgets/${widgetId}`, userId);
  }

  createWidget(data: any, userId: string) {
    return this.forwardRequest('post', '/widgets', userId, data);
  }

  updateWidget(widgetId: string, data: any, userId: string) {
    return this.forwardRequest('put', `/widgets/${widgetId}`, userId, data);
  }

  deleteWidget(widgetId: string, userId: string) {
    return this.forwardRequest('delete', `/widgets/${widgetId}`, userId);
  }

  refreshWidget(widgetId: string, userId: string) {
    return this.forwardRequest('post', `/widgets/${widgetId}/refresh`, userId);
  }
}
