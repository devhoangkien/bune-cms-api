import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import LokiTransport from 'winston-loki';
import TransportStream from 'winston-transport';
import axios from 'axios';
import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

export interface LoggerOptions {
  enableConsole?: boolean;
  enableFile?: boolean;
  enableMongoDB?: boolean;
  enableElasticsearch?: boolean;
  enableLoki?: boolean;
  enableCloudWatch?: boolean;
  enableDatadog?: boolean;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private cloudWatchClient: CloudWatchLogsClient | null = null;

  constructor(private options: LoggerOptions) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: this.getTransports(),
    });

    if (this.options.enableCloudWatch) {
      this.cloudWatchClient = new CloudWatchLogsClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });
    }
  }

  private getTransports(): TransportStream[] {
    const transports: TransportStream[] = [];

    if (this.options.enableConsole) {
      transports.push(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }));
    }

    if (this.options.enableFile) {
      transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
      transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
    }
  
    if (this.options.enableElasticsearch) {
      transports.push(new ElasticsearchTransport({
        level: 'info',
        clientOpts: { node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200' },
      }));
    }

    if (this.options.enableLoki) {
      transports.push(new LokiTransport({
        host: process.env.LOKI_URL || 'http://localhost:3100',
        json: true,
      }));
    }

    if (this.options.enableDatadog) {
      transports.push(new DatadogTransport());
    }

    return transports;
  }

  log(message: string) {
    this.logger.info(message);
    if (this.options.enableCloudWatch) this.sendToCloudWatch('INFO', message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} - ${trace || 'No trace'}`);
    if (this.options.enableCloudWatch) this.sendToCloudWatch('ERROR', message);
  }

  warn(message: string) {
    this.logger.warn(message);
    if (this.options.enableCloudWatch) this.sendToCloudWatch('WARN', message);
  }

  debug(message: string) {
    this.logger.debug(message);
    if (this.options.enableCloudWatch) this.sendToCloudWatch('DEBUG', message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
    if (this.options.enableCloudWatch) this.sendToCloudWatch('VERBOSE', message);
  }

  private async sendToCloudWatch(level: string, message: string) {
    if (!this.cloudWatchClient) return;
    try {
      await this.cloudWatchClient.send(
        new PutLogEventsCommand({
          logGroupName: process.env.CLOUDWATCH_LOG_GROUP || 'nestjs-logs',
          logStreamName: process.env.CLOUDWATCH_LOG_STREAM || 'nestjs-stream',
          logEvents: [{ timestamp: Date.now(), message: `[${level}] ${message}` }],
        })
      );
    } catch (error) {
      console.error('Error sending log to CloudWatch:', error);
    }
  }
}

class DatadogTransport extends TransportStream {
  constructor() {
    super();
  }

  log(info: any, callback: () => void) {
    axios.post('https://http-intake.logs.datadoghq.com/api/v2/logs', {
      ddsource: 'nodejs',
      service: process.env.DATADOG_SERVICE_NAME || 'my-nestjs-app',
      message: info.message,
      level: info.level,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': process.env.DATADOG_API_KEY || '',
      },
    }).catch((error) => console.error('Error sending log to Datadog:', error));

    callback();
  }
}