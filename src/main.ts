import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerConfig } from './LoggerConfig';


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
  console.debug(process.env.FUZZER_SEEDER_PORT);
  await app.listen(+process.env.FUZZER_SEEDER_PORT || 3002);
}
bootstrap();
