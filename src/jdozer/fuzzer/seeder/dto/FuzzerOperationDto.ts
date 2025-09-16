/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { UUID } from "crypto";

export class FuzzerOperation {

    id: UUID;
    name: string;
    req: any;
    res: any[];
    parameters: any;
    path: string;
    method: string;
    
}