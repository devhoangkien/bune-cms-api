# LoggerModule - NestJS Common Library

## 1. Giới thiệu

LoggerModule là một module logging sử dụng Winston để hỗ trợ ghi log vào nhiều nguồn khác nhau như console, file, MongoDB, Elasticsearch, Loki, CloudWatch, và Datadog. Module này có thể được cấu hình linh hoạt thông qua biến môi trường (.env).

## 2. Cài đặt

Trước tiên, cài đặt các dependency cần thiết:

```bash
npm install @nestjs/common @nestjs/config winston winston-mongodb winston-elasticsearch winston-loki @aws-sdk/client-cloudwatch-logs axios
```

## 3. Cấu hình .env

Tạo hoặc cập nhật file `.env` để bật/tắt các loại logging:

```env
LOG_CONSOLE=true
LOG_FILE=true
LOG_ELASTIC=false
LOG_LOKI=true
LOG_CLOUDWATCH=false
LOG_DATADOG=false

ELASTICSEARCH_HOST=http://localhost:9200
LOKI_URL=http://localhost:3100
CLOUDWATCH_LOG_GROUP=nestjs-logs
CLOUDWATCH_LOG_STREAM=nestjs-stream
DATADOG_API_KEY=your-datadog-api-key
DATADOG_SERVICE_NAME=my-nestjs-app
```

## 4. Sử dụng LoggerModule trong NestJS

Trong `app.module.ts`, import `LoggerModule` và sử dụng `forRoot()`:

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@libs/common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), // Load .env
        LoggerModule.forRoot(),
    ],
})
export class AppModule {}
```

## 5. Sử dụng LoggerService

Inject `LoggerService` vào bất kỳ service hoặc controller nào:

```typescript
import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@libs/common/logger/logger.service';

@Controller('example')
export class ExampleController {
    constructor(private readonly logger: LoggerService) {}

    @Get()
    testLogging(): string {
        this.logger.log('This is an info log');
        this.logger.warn('This is a warning log');
        this.logger.error('This is an error log');
        this.logger.debug('This is a debug log');
        return 'Check your logs!';
    }
}
```

## 6. Các phương thức logging

| Phương thức | Mô tả |
|-------------|-------|
| `log(message: string)` | Ghi log mức độ info. |
| `error(message: string, trace?: string)` | Ghi log mức độ error. |
| `warn(message: string)` | Ghi log mức độ warn. |
| `debug(message: string)` | Ghi log mức độ debug. |
| `verbose(message: string)` | Ghi log mức độ verbose. |

## 7. Mở rộng & Tuỳ chỉnh

Nếu cần mở rộng, có thể thêm transport mới trong `logger.service.ts`. Ví dụ, thêm logging vào một hệ thống bên ngoài khác như New Relic hoặc Splunk.

```typescript
transports.push(new winston.transports.Http({
    host: process.env.NEW_RELIC_HOST || 'https://log-api.newrelic.com',
    path: '/log/v1',
}));
```

## 8. Kết luận

LoggerModule giúp quản lý logging dễ dàng và linh hoạt trong NestJS.

Cấu hình thông qua `.env` giúp thay đổi mà không cần sửa code.

Hỗ trợ nhiều nền tảng logging phổ biến như Console, File, MongoDB, Elasticsearch, Loki, CloudWatch, và Datadog.

Bạn có thể tùy chỉnh thêm nếu cần! 🚀
