/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {

    private readonly log = new Logger(RedisService.name);

    private client: Redis.Redis;

    constructor() {
        this.client = new Redis.Redis({
            host: process.env.FUZZER_REDIS_HOST,
            port: +process.env.FUZZER_REDIS_PORT
        });
    }

    async set(key: string, value: any) {
        await this.client.set(key, JSON.stringify(value));
    }

    async get(key: string): Promise<any> {
        let data: any = JSON.parse(await this.client.get(key));
        return data;
    }

    async flushall() {
        await this.client.flushall();
    }

    async publish(channel: string, payload: any) {
        //payload.data = Buffer.from(JSON.stringify(payload.data), 'binary').toString('base64');
        const payloadJson = JSON.stringify(payload);
        const eventId = await this.client.publish(channel, payloadJson);
        this.log.verbose(`publish: ${channel} / ${eventId} - ${payloadJson}`);
        return;
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}