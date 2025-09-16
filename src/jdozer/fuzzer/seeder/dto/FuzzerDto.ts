/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { UUID } from "crypto";

export class Fuzzer {

    id: UUID;
    name: string;
    version: string;
    owner: UUID;
    servers: any[];
    operationIds: string[];

}