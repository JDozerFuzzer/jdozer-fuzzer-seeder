/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

export class SeederException extends Error {
    constructor(error: {message: string, details?: any}) {
        super(error.message);
        this.name = 'SeederException';
    }
}