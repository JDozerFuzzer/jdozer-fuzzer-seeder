/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { generate } from './generator/Generator';

export class Dummy {

    constructor() { }

    async generate(schema: string) {
        let dummy = generate(schema);
        return dummy;
    }

}