/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { UUID } from "crypto";

export class FuzzerDummy {

    id: UUID;
    payloads: any[];
    headers: any[];
    querys: any[];
    paths: any[];

}