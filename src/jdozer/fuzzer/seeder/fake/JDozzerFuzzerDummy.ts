/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { randomUUID, UUID } from "crypto";
import { Fuzzer } from "../dto/FuzzerDto";
import { FuzzerDummy } from "./dto/FuzzerDummy";
import { FuzzerOperation } from "../dto/FuzzerOperationDto";
import { generate } from './generator/Generator';
import { RedisService } from "../persistence/RedisService";
import { Logger } from "@nestjs/common";
import { KeyManager } from "../persistence/KeyManager";


export class JDozerFuzzerDummy {

    private readonly log = new Logger(JDozerFuzzerDummy.name);
    private readonly keyManager: KeyManager = new KeyManager();

    constructor(private readonly fuzzer: Fuzzer, private readonly redis: RedisService) { }

    async build() {
        this.fuzzer.operationIds.forEach(async id => {
            let op: FuzzerOperation = await this.getOperation(id);
            this.dummy(op);
        });
        return;
    }

    private async getOperation(operationId: string): Promise<FuzzerOperation> {
        return await this.redis.get(this.keyManager.forOperation(operationId, this.fuzzer.id));
    }

    private async dummy(operation: FuzzerOperation) {

        let dummy: FuzzerDummy = new FuzzerDummy();
        dummy.payloads = this.createDummy(operation.req.payload);
        dummy.headers = this.createDummy(operation.parameters.header);
        dummy.querys = this.createDummy(operation.parameters.query);
        dummy.paths = this.createDummy(operation.parameters.path);
        dummy.id = randomUUID() as UUID;

        for (let d of dummy.payloads) {
            this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'payload', d.id), d);
            // await this.redis.set(operation.name.concat(':payload:'.concat(d.id)), d);
        }

        for (let d of dummy.headers) {
            this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'headers', d.id), d);
        }

        for (let d of dummy.querys) {
            this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'query', d.id), d);
            // await this.redis.set(operation.name.concat(':query:').concat(d.id), d);
        };

        for (let d of dummy.paths) {
            this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'path', d.id), d);
        };

        return;
    }

    private createDummy(schema: any) {
        let d: any[] = generate(schema);
        return d.map(v => {
            v.id = randomUUID() as UUID;
            v.data = Buffer.from(JSON.stringify(v.data)).toString('base64');
            return v;
        });
    }

}