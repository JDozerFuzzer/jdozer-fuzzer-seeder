import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


async function bootstrap() {
  try {
    await ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true
    });
  } catch (error) {
    console.error('Error setting up configuration:', error);
    process.exit(1);
  }

  const logger = new ConsoleLogger('JDozerFuzzer-Seeder');
  const logLevel: LogLevel[] = [];
  process.env.LOG_LEVEL.split(',').forEach(level => {
    logLevel.push(level as LogLevel);
  });
  logger.setLogLevels(logLevel);

  const app = await NestFactory.create(AppModule, {
    logger: logger
  });
  
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['POST']
  });
  app.useGlobalPipes(new ValidationPipe());
  console.debug(process.env.APP_PORT);
  await app.listen(+process.env.APP_PORT || 3002);
}
bootstrap();
