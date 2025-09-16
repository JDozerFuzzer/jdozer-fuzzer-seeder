/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { JSONPath } from "jsonpath-plus";
import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import * as YAML from 'yaml';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Logger } from "@nestjs/common";
import { JDozerOpenApiLoadException } from "./JDozerOpenApiLoadException";
import { UniqueList } from "../../utils/UniqueList";
import { DuplicateKeyException } from "../../utils/DuplicateKeyException";


export class JDozerOpenApiLoad {

    private readonly log = new Logger(JDozerOpenApiLoad.name);
    private contract: any;
    constructor(private readonly openapi: any) {
    }

    async build() {
        this.contract = await this.refParser(this.toJson(this.openapi));
        return this;
    }

    getRequestBody(operationId: string) {
        let query = `$.paths.*.[?(@.operationId == '${operationId}')].requestBody.content.['application/json'].schema`;
        let requestBody: any = JSONPath({ path: query, json: this.contract });
        if (requestBody.length == 1)
            return this.toJSONSchema(requestBody[0]);
        else
            return {};
    }

    getResponsesSchemas(operationId: string) {
        let query = `$.paths.*.[?(@.operationId == '${operationId}')].responses`;
        let responses: any[] = JSONPath({ path: query, json: this.contract });

        if (responses.length != 1)
            return [];

        let statusCodeKeys: any[] = Object.keys(responses[0]);
        let ress: any[] = statusCodeKeys.map((value) => {
            let res: any = { statusCode: value };
            let query = `$.content.['application/json'].schema`;
            let schema = JSONPath({ path: query, json: responses[0][value] });
            if (schema.length == 1)
                res.schema = schema[0];

            return res;

        });
        return ress;
    }

    getOperationIds(): UniqueList<string> {
        let query: string = `$.paths.*.*.operationId`;
        const ops: string[] = JSONPath({ path: query, json: this.contract });
        if (ops.length == 0) {
            const errorMsg = `getOperationIds: No operation found!`;
            this.log.error(errorMsg);
            throw new JDozerOpenApiLoadException({ message: errorMsg });
        } else if (ops.length > 0) {
            try {
                return new UniqueList<string>(ops);
            } catch (e) {
                const errorMsg = `getOperationIds: Duplicate operationId found!: ${e}`;
                this.log.error(errorMsg);
                throw new JDozerOpenApiLoadException({ message: errorMsg });
            }
        }
    }

    private toJSONSchema(openapiSchema: any) {
        return openapiSchemaToJsonSchema(openapiSchema);
    }

    getParametersSchema(operationId: string) {
        let query: string = `$.paths.*.[?(@.operationId == '${operationId}')].parameters`;
        let parameters: any[] = JSONPath({ path: query, json: this.contract });

        let params: any = {};
        if (parameters.length == 1) {
            parameters[0].forEach(parameter => {
                if (!params[`${parameter.in}`])
                    params[`${parameter.in}`] = { properties: {}, required: [] };

                params[`${parameter.in}`][`properties`][`${parameter.name}`] = parameter.schema;
                if (parameter.required) params[`${parameter.in}`].required.push(parameter.name);
            });

        }

        return params;

    }

    getPath(operationId: string): string {
        let query: string = `$.paths.*.[?(@.operationId == '${operationId}')]`;
        let pointer: string[] = JSONPath({ path: query, json: this.contract, resultType: `pointer` });
        if (pointer.length == 1) {
            return (pointer[0].split(`/`)[2].replaceAll(`~1`, `/`));
        } else {
            throw new JDozerOpenApiLoadException({ message: `getPath: operationId no valid!` });
        }
    }

    getMethod(operationId: string) {
        let query: string = `$.paths.*.[?(@.operationId == '${operationId}')]`;
        let pointer: string[] = JSONPath({ path: query, json: this.contract, resultType: `pointer` });
        if (pointer.length == 1) {
            return pointer[0].split(`/`)[3];
        } else {
            const errorMsg = `getMethod: method not found!`;
            this.log.error(`getMethod: ${errorMsg}`);
            this.log.debug(operationId, pointer);
            throw new JDozerOpenApiLoadException({ message: errorMsg, details: operationId });
        }
    }

    getServers() {
        if (this.contract.servers) {
            return this.contract.servers;
        } else {
            const errorMsg = `Servers not found.`;
            this.log.error(`getServers: ${errorMsg}`);
            throw new JDozerOpenApiLoadException({ message: errorMsg });
        }
    }

    private toJson(contract: any) {
        try {
            return YAML.parse(contract);
        } catch (e) {
            this.log.error(`toJson: ${e}`);
            throw new JDozerOpenApiLoadException({ message: `toJson: ${e}` });
        }
    }

    private async refParser(contract: any) {
        try {
            return await $RefParser.dereference(contract, { mutateInputSchema: false });
        } catch (e) {
            this.log.error(`refParser: ${e}`);
            throw new JDozerOpenApiLoadException({ message: `refParser: ${e}` });
        }
    }

    public getOperation(operationId: string) {

        let requestBodySchema: any = this.getRequestBody(operationId);
        let responsesBodySchemas: any[] = this.getResponsesSchemas(operationId);
        let parametersSchemas: any = this.getParametersSchema(operationId);
        let path: string = this.getPath(operationId);
        let method: string = this.getMethod(operationId);


        let operation = {
            name: operationId,
            req: {
                payload: requestBodySchema
            },
            res: responsesBodySchemas,
            parameters: parametersSchemas,
            path: path,
            method: method
        };

        return operation;
    }

    public getToEncode(): string {
        const encode: string = Buffer.from(JSON.stringify(this.contract)).toString(`base64`);
        return encode;
    }
}