/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Injectable, Logger } from '@nestjs/common';

import { Fuzzer } from './dto/FuzzerDto';
import { RedisService } from './persistence/RedisService';
import { SeederException } from './SeederException';
import { JDozerFuzzerSeeder } from './JDozerFuzzerSeeder';
import { FuzzerCreateDto } from './api/dto/FuzzerCreateDto';
import { EventService } from './event/EventService';


@Injectable()
export class SeederService {

  private readonly log = new Logger(SeederService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly eventService: EventService
  ) { }

  async create(fuzzerCreateDto: FuzzerCreateDto, contract: string) {

    try {

      let jdFuzzer: JDozerFuzzerSeeder = new JDozerFuzzerSeeder(this.redisService);
      let fuzzer: Fuzzer = await jdFuzzer.buildFuzzer(contract, fuzzerCreateDto);
      await jdFuzzer.buildDummy(fuzzer);
      await jdFuzzer.buildEngine(fuzzer);

      this.log.log(`Fuzzer created: ${fuzzer.id}`, `Fuzzer: ${fuzzer.name}, version: ${fuzzer.version}`);
      this.log.debug(JSON.stringify(fuzzer));

      this.eventService.publishEvent(EventService.EVENT_TYPE.BUILD_SUCCESS, fuzzer, fuzzer.id);
      return fuzzer;

    } catch (error) {

      const errorMessage = {
        message: `Error create fuzzer`,
        details: error.message
      };

      this.log.error(`${error.message}`);
      this.log.verbose(`FuzzerCreateDto: ${JSON.stringify(fuzzerCreateDto)}`);
      this.eventService.publishEvent(EventService.EVENT_TYPE.BUILD_FAILURE, errorMessage, null);
      throw new SeederException(error);

    }
  }

}
