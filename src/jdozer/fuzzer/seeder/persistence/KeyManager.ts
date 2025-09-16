/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Logger } from "@nestjs/common";
import { randomUUID, UUID } from "crypto";


export class KeyManager {

    private readonly log = new Logger(KeyManager.name);

    private readonly JDF: string = 'JDF';

    public forFuzz(id: UUID): string {
        return this.JDF.concat(':').concat(id.toString());
    }

    public forOperation(id: string, fuzzerId: UUID): string {
        return this.forFuzz(fuzzerId).concat(':OP:').concat(id);
    }

    public forFake(fuzzerId: UUID, operation: string, context: string, fid: UUID): string {
        return this.forFuzz(fuzzerId).concat(':DMM:').concat(operation).concat(':').concat(context).concat(':').concat(fid.toString());
    }

    public forEngine(fuzzerId: UUID): string {
        return this.forFuzz(fuzzerId).concat(':ENG');
    }

    public forApi(fuzzerId: UUID): string {
        return this.forFuzz(fuzzerId).concat(':API');
    }

    public getUUIDForFuzz(fuzzer: string): UUID {
        return fuzzer.split(':')[1] as UUID;
    }

    public getUUIDForOperation(operation: string): UUID {
        return operation.split(':')[3] as UUID;
    }

}