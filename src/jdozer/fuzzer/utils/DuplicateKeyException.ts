/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */
export class DuplicateKeyException extends Error {
    constructor(key: string) {
        super(`Key ${key} already exists in the map.`);
        this.name = 'DuplicateKeyException';
    }
}