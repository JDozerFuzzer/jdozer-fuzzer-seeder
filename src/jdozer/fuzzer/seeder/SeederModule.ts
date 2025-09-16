/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Module } from '@nestjs/common';
import { SeederService } from './SeederService';
import { RedisService } from './persistence/RedisService';
import { ConfigModule } from '@nestjs/config';
import { FuzzerController } from './api/FuzzerController';
import { EventService } from './event/EventService';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true
    })
  ],
  controllers: [FuzzerController],
  providers: [SeederService, EventService, RedisService]
})
export class SeederModule { }
