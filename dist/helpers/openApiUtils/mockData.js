"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateValidValue = exports.generateInvalidMockData = exports.generateValidMockData = void 0;
const lodash_1 = __importDefault(require("lodash"));
const { random, sample } = lodash_1.default;
const faker_1 = require("@faker-js/faker");
const getRef_1 = require("../../openApi/src/openApi/v3/parser/getRef");
const generateValidMockData = (schema, openApi) => {
    switch (schema.type) {
        case 'string':
            return faker_1.faker.lorem.word();
        case 'integer':
        case 'number':
            return random(0, schema.maximum || 100, false);
        case 'boolean':
            return sample([true, false]);
        case 'array':
            let itemSchema = (0, getRef_1.getRef)(openApi, schema.items);
            return Array(random(0, schema.maxItems || 5, false)).fill((0, exports.generateValidMockData)(itemSchema, openApi));
        case 'object':
            const properties = schema.properties || {};
            const result = {};
            for (const [propName, propSchema] of Object.entries(properties)) {
                let resolvedSchema = (0, getRef_1.getRef)(openApi, propSchema);
                result[propName] = (0, exports.generateValidMockData)(resolvedSchema, openApi);
            }
            return result;
        default:
            return null;
    }
};
exports.generateValidMockData = generateValidMockData;
const generateInvalidMockData = (schema, openApi, required = []) => {
    switch (schema.type) {
        case 'string':
            return schema.maxLength
                ? random(schema.maxLength + 1, schema.maxLength + 10).toString()
                : 123;
        case 'integer':
        case 'number':
            return schema.maximum ? schema.maximum + random(1, 10, false) : 'invalidNumber';
        case 'boolean':
            return sample([123, 'invalidBoolean', [], {}]);
        case 'array':
            let itemSchema = (0, getRef_1.getRef)(openApi, schema.items);
            return schema.maxItems
                ? Array(schema.maxItems + random(1, 5, false)).fill((0, exports.generateValidMockData)(itemSchema, openApi))
                : 'invalidArray';
        case 'object':
            const properties = schema.properties || {};
            const result = {};
            for (const [propName, propSchema] of Object.entries(properties)) {
                let resolvedSchema = (0, getRef_1.getRef)(openApi, propSchema);
                result[propName] = (0, exports.generateInvalidMockData)(resolvedSchema, openApi, schema.required);
            }
            if (required.length > 0)
                delete result[sample(required)];
            return result;
        default:
            return 'invalidValue';
    }
};
exports.generateInvalidMockData = generateInvalidMockData;
/**
 * Generate a valid value for a parameter based on its schema
 * @param {OpenApiParameter} parameter - The parameter to generate a value for
 * @param openAPISpec
 * @returns {any} - A valid value for the parameter
 */
const generateValidValue = (parameter, openAPISpec) => {
    return (0, exports.generateValidMockData)(parameter.schema, openAPISpec);
};
exports.generateValidValue = generateValidValue;
//# sourceMappingURL=mockData.js.map