/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Injectable } from "@nestjs/common";
import { RedisService } from "../persistence/RedisService";
import { randomUUID, UUID } from "crypto";


@Injectable()
export class EventService {

    private static readonly MY_CHANNEL = 'fuzzer:seeder';
    private static readonly ENTITY_TYPE = 'fuzzer-seeder';

    constructor(private readonly redisService: RedisService) { }

    public async publishEvent(eventType: EventService.EVENT_TYPE, data: Object | Array<any>, entityId: UUID) {

        const message: any = {
            headers: {
                id: randomUUID(),
                timestamp: new Date().getTime(),
                entityId: entityId,
                entityType: EventService.ENTITY_TYPE,
                eventType: eventType
            },
            payload: data
        };

        await this.redisService.publish(EventService.MY_CHANNEL, message);
    }

}

export namespace EventService {

    export enum EVENT_TYPE {
        BUILD_SUCCESS = 'builder-successful',
        BUILD_FAILURE = 'build-failure',
        BUILD_START = 'build-start',
        BUILD_STOP = 'build-stop',
        BUILD_PAUSE = 'build-pause',
        READ_CONTRACT = 'read-contract-runtime',
        ERROR = 'error',
        CASES_CREATED = 'cases-created'
    }
};