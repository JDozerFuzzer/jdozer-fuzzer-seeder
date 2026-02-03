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

  private fuzzer: Fuzzer;

  constructor(
    private readonly redisService: RedisService,
    private readonly eventService: EventService
  ) { }

  async create(fuzzerCreateDto: FuzzerCreateDto, contract: string) {

    try {

      let jdFuzzer: JDozerFuzzerSeeder = new JDozerFuzzerSeeder(this.redisService, this.eventService);
      this.fuzzer = await jdFuzzer.buildFuzzer(contract, fuzzerCreateDto);

      const message: any = {
        fuzzerId: this.fuzzer.id,
        contract: {
          name: this.fuzzer.name,
          version: this.fuzzer.version,
          endpoint: this.fuzzer.servers[0].url,
          operations: this.fuzzer.operationIds
        }
      };

      await this.eventService.publishEvent(EventService.EVENT_TYPE.READ_CONTRACT, message, this.fuzzer.id);

      let dummy = await jdFuzzer.buildDummy(this.fuzzer);

      const messageDummy: any = {
        fuzzerId: this.fuzzer.id,
        cases: dummy
      };

      await this.eventService.publishEvent(EventService.EVENT_TYPE.CASES_CREATED, messageDummy, this.fuzzer.id);
      await jdFuzzer.buildEngine(this.fuzzer);

      this.log.log(`Fuzzer created: ${this.fuzzer.id}`, `Fuzzer: ${this.fuzzer.name}, version: ${this.fuzzer.version}`);
      this.log.debug(JSON.stringify(this.fuzzer));

      const successEvent: any = {
        fuzzerId: this.fuzzer.id,
        message: `Fuzzer created successfully`,
        details: `Fuzzer: ${this.fuzzer.name}, version: ${this.fuzzer.version}`,
        action: 'success'
      };

      await this.eventService.publishEvent(EventService.EVENT_TYPE.BUILD_SUCCESS, successEvent, this.fuzzer.id);

      return this.fuzzer;

    } catch (error) {

      const errorMessage = {
        message: `Error create fuzzer`,
        details: error.message
      };

      this.log.error(`${error.message}`);
      this.log.verbose(`FuzzerCreateDto: ${JSON.stringify(fuzzerCreateDto)}`);

      const errorEvent: any = {
        fuzzerId: this.fuzzer?.id,
        message: `Error trying to create the fuzzer: ${error.message}`,
        details: error.toString(),
        action: 'abort'
      };

      await this.eventService.publishEvent(EventService.EVENT_TYPE.ERROR, errorEvent, this.fuzzer?.id);

      throw new SeederException(error);

    }
  }

}
