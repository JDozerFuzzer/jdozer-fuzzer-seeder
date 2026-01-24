/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Fuzzer } from "../dto/FuzzerDto";
import { FuzzerOperation } from "../dto/FuzzerOperationDto";
import * as YAML from 'yaml';
import { RedisService } from "../persistence/RedisService";
import { KeyManager } from "../persistence/KeyManager";
import { Logger } from "@nestjs/common";
import { EngineException } from "./EngineException";


export class JDozerFuzzerEngineCfg {

    private readonly log = new Logger(JDozerFuzzerEngineCfg.name);
    private readonly keyManager: KeyManager = new KeyManager();

    constructor(private readonly fuzzer: Fuzzer, private readonly redis: RedisService) { }

    async build() {

        this.engineCfg.config.variables.testId = this.fuzzer.id;
        this.engineCfg.config.plugins[`publish-metrics`][0].tags.push(`jdozer:${this.fuzzer.name}`);

        let server: any[] = this.fuzzer.servers.filter(server => server.description === 'FUZZING');
        if (server.length == 0) {
            const error = { message: `build: The fuzzer ${this.fuzzer.name} has no server with description 'FUZZING'`, detail: 'No enveironment selected' };
            this.log.error(error);
            throw new EngineException(error);
        }
        this.engineCfg.config.target = (server.length == 1 ? server[0].url : undefined);

        for (let id of this.fuzzer.operationIds) {
            const op: FuzzerOperation = await this.redis.get(this.keyManager.forOperation(id, this.fuzzer.id));
            let scenario = this.getScenarios(op);
            scenario.flow.push(this.getFlows(op));
            this.engineCfg.scenarios.push(scenario);
        };

        await this.redis.set(this.keyManager.forEngine(this.fuzzer.id), this.engineCfg);
        let engineCfgYaml: string = YAML.stringify(this.engineCfg);

        return engineCfgYaml;

    }

    private getScenarios(operation: FuzzerOperation) {
        return {
            name: `${operation.name}`,
            beforeScenario: `beforeScenario`,
            flow: []
        };
    }

    private getFlows(operation: any) {
        return {
            [`${operation.method}`]: {
                beforeRequest: `beforeRequest`,
                url: `${operation.path}`,
                afterResponse: `afterResponse`
            }
        };
    }

    private engineCfg: any = {
        config: {
            plugins: {
                ['publish-metrics']: [{
                    type: `prometheus`,
                    pushgateway: `http://localhost:9091`,
                    tags: [`jdozer:testName`, `version:1.0`]
                }]
            },
            target: `url`,
            processor: `./JDozerFuzzerArtillery.js`,
            phases: [{
                duration: '1',
                arrivalRate: 3,
                maxVusers: 6,
                name: `phase-1`
            }, {
                duration: '1',
                arrivalRate: 5,
                maxVusers: 10,
                name: `phase-2`
            }],
            defaults: {
                headers: {
                    [`Content-Type`]: `application/json`,
                    Authorization: `Bearer akjhdaskjhdkashdakjshda`
                }
            },
            variables: {
                testId: ``
            },
        },
        scenarios: [],
        after: {
            flow: [{
                function: `afterTest`
            }]
        }
    };

}