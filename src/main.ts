import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerConfig } from './LoggerConfig';
import { Logger } from '@nestjs/common';


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

  const app = await NestFactory.create(AppModule, {
    logger: LoggerConfig.logLevels('JDozerFuzzer-Seeder')
  });

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['POST']
  });
  app.useGlobalPipes(new ValidationPipe());

  const port = +process.env.FUZZER_SEEDER_PORT || 3002;
  const logger = new Logger('JDozerFuzzer-Seeder-bootstrap');

  logger.log(`FUZZER_SEEDER_PORT: ${process.env.FUZZER_SEEDER_PORT}`);
  await app.listen(port);
}
bootstrap();
