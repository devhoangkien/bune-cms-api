import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@bune/common';
import chalk from 'chalk';
import figlet from 'figlet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);
  logger.log('🚀 Starting application...');
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  const buneCmsArt = figlet.textSync('BUNE CMS', {
    font: 'Slant', 
    horizontalLayout: 'default',
    verticalLayout: 'default',
  });

  console.log(chalk.blueBright(buneCmsArt)); 

  console.log(chalk.greenBright('by devhoangkien')); 
  logger.log(`✅ Application is running on: ${chalk.redBright(`http://localhost:${port}`)}`);
}
bootstrap();
