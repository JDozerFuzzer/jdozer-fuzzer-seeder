/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */
import { randomUUID, UUID } from "crypto";
import { Fuzzer } from "./dto/FuzzerDto";
import { JDozerOpenApiLoad } from "./openapi/JDozerOpenApiLoad";
import { JDozerFuzzerDummy } from "./fake/JDozzerFuzzerDummy";
import { RedisService } from "./persistence/RedisService";
import { JDozerFuzzerEngineCfg } from "./engine/JDozerFuzzerEngineCfg";
import { UniqueList } from "../utils/UniqueList";
import { SeederException } from "./SeederException";
import { Logger } from "@nestjs/common";
import { KeyManager } from "./persistence/KeyManager";


export class JDozerFuzzerSeeder {

    private readonly log = new Logger(JDozerFuzzerSeeder.name);

    private fuzzer: Fuzzer;
    private keyManager: KeyManager = new KeyManager();

    constructor(private readonly redis: RedisService) { }

    async buildFuzzer(contract: any, fields: any): Promise<Fuzzer> {

        try {

            let openApi: JDozerOpenApiLoad = await (new JDozerOpenApiLoad(contract)).build();

            this.fuzzer = new Fuzzer();
            this.fuzzer.id = randomUUID() as UUID;
            this.fuzzer.name = fields.name;
            this.fuzzer.version = fields.version;
            this.fuzzer.servers = openApi.getServers();
            this.fuzzer.operationIds = this.buildOperations(openApi);

            await this.redis.set(this.keyManager.forFuzz(this.fuzzer.id), this.fuzzer);
            await this.redis.set(this.keyManager.forApi(this.fuzzer.id), openApi.getToEncode());

            return this.fuzzer;

        } catch (e) {
            const errorMsg = `buildFuzzer: The openapi contract contains errors!: ${e.message}`;
            this.log.error(errorMsg);
            throw new SeederException({ message: errorMsg, details: e.toString() });
        }
    }

    private buildOperations(openApi: JDozerOpenApiLoad): string[] {
        let operationIds: UniqueList<string> = openApi.getOperationIds();

        let operationsSchemaIds: UUID[] = operationIds.values().map((operationId) => {
            let operation: any = openApi.getOperation(operationId);
            operation.id = randomUUID() as UUID;
            this.redis.set(this.keyManager.forOperation(operation.name, this.fuzzer.id), operation);
            return operation.name;
        });

        return operationsSchemaIds;
    }

    async buildDummy(fuzzer: Fuzzer) {
        let dummy: JDozerFuzzerDummy = new JDozerFuzzerDummy(fuzzer, this.redis);
        await dummy.build();
    }

    async buildEngine(fuzzer: Fuzzer) {
        let artilleryCfg: JDozerFuzzerEngineCfg = new JDozerFuzzerEngineCfg(fuzzer, this.redis);
        return await artilleryCfg.build();
    }

}