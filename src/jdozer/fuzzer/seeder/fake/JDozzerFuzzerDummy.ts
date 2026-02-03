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
import { SeederException } from "../SeederException";


export class JDozerFuzzerDummy {

    private readonly log = new Logger(JDozerFuzzerDummy.name);
    private readonly keyManager: KeyManager = new KeyManager();

    constructor(private readonly fuzzer: Fuzzer, private readonly redis: RedisService) { }

    async build(): Promise<any> {
        let dummyCant: any = {};
        for (let opId of this.fuzzer.operationIds) {
            let op: FuzzerOperation = await this.getOperation(opId);
            dummyCant[op.name] = await this.dummy(op);
            this.log.verbose(`Dummy created for operation ${op.name} ${JSON.stringify(dummyCant[op.name])}`);
        }
        return dummyCant;
    }

    private async getOperation(operationId: string): Promise<FuzzerOperation> {
        return await this.redis.get(this.keyManager.forOperation(operationId, this.fuzzer.id));
    }

    private async dummy(operation: FuzzerOperation) {

        const promises: Promise<any>[] = [];

        let dummy: FuzzerDummy = new FuzzerDummy();
        dummy.payloads = this.createDummy(operation.req.payload);
        dummy.headers = this.createDummy(operation.parameters.header);
        dummy.querys = this.createDummy(operation.parameters.query);
        dummy.paths = this.createDummy(operation.parameters.path);
        dummy.id = randomUUID() as UUID;

        for (let d of dummy.payloads) {
            promises.push(this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'payload', d.id), d));
        }

        for (let d of dummy.headers) {
            promises.push(this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'headers', d.id), d));
        }

        for (let d of dummy.querys) {
            promises.push(this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'query', d.id), d));
        };

        for (let d of dummy.paths) {
            promises.push(this.redis.set(this.keyManager.forFake(this.fuzzer.id, operation.name, 'path', d.id), d));
        };

        return await Promise.all(promises).then(() => {
            return {
                payloads: dummy.payloads.length,
                headers: dummy.headers.length,
                querys: dummy.querys.length,
                paths: dummy.paths.length
            };
        }).catch(e => {
            this.log.error(`Error building dummy for operation ${operation.name}: ${e.message}`);
            throw new SeederException(e);
        });
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