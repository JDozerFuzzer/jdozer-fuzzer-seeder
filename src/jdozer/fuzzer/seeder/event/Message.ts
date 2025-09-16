/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { UUID } from "crypto";

export class Message {

    id: UUID;
    timestamp: Number;
    traceId: UUID;
    entityId: UUID;
    entityType: string;
    eventType: string;
    data: any;

}