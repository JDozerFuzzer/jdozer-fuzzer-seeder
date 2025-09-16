/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */
import { DuplicateKeyException } from "./DuplicateKeyException";

export class HashMap<T> {

    private map = new Map<string, T>();

    set(key: string, value: T) {
        if (this.map.has(key)) {
            throw new DuplicateKeyException(key);
        }
        this.map.set(key, value);
    }

    get(key: string): T | undefined {
        return this.map.get(key);
    }
    
    has(key: string): boolean {
        return this.map.has(key);
    }

}