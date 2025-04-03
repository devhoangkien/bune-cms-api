import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService, LoggerOptions } from './logger.service';

@Module({
  imports: [ConfigModule],
})
export class LoggerModule {
  static forRoot(options: LoggerOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: LoggerService,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const defaultOptions: LoggerOptions = {
              enableConsole: configService.get<boolean>('LOG_CONSOLE', true),
              enableFile: configService.get<boolean>('LOG_FILE', false),
              enableMongoDB: configService.get<boolean>('LOG_MONGODB', false),
              enableElasticsearch: configService.get<boolean>('LOG_ELASTIC', false),
              enableLoki: configService.get<boolean>('LOG_LOKI', false),
              enableCloudWatch: configService.get<boolean>('LOG_CLOUDWATCH', false),
              enableDatadog: configService.get<boolean>('LOG_DATADOG', false),
            };
            const mergedOptions: LoggerOptions = { ...defaultOptions, ...options };
            return new LoggerService(mergedOptions);
          },
        },
      ],
      exports: [LoggerService],
    };
  }
}