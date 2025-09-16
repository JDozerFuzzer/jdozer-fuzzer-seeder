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

    private static readonly CHANNEL = 'jdozer:fuzzer:broker';
    private static readonly ENTITY_TYPE = 'fuzzer-seeder';

    constructor(private readonly redisService: RedisService) { }

    public async publishEvent(eventType: EventService.EVENT_TYPE, data: Object | Array<any>, entityId: UUID) {
        const id = randomUUID();
        const message = {
            id: id,
            timestamp: new Date().getMilliseconds(),
            traceId: id,
            entityId: entityId,
            entityType: EventService.ENTITY_TYPE,
            eventType: eventType,
            data: data
        };

        await this.redisService.publish(EventService.CHANNEL, message);
        
    }

}

export namespace EventService {

    export enum EVENT_TYPE {
        BUILD_SUCCESS = 'build-success',
        BUILD_FAILURE = 'build-failure',
        BUILD_START = 'build-start',
        BUILD_STOP = 'build-stop',
        BUILD_PAUSE = 'build-pause'
    }
};