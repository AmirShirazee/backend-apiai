import pkg from 'lodash';
const { random, sample } = pkg;
import { faker } from '@faker-js/faker';
import { OpenApiSchema } from '../../openApi/src/openApi/v3/interfaces/OpenApiSchema';
import { OpenApi } from '../../openApi/src/openApi/v3/interfaces/OpenApi';
import { getRef } from '../../openApi/src/openApi/v3/parser/getRef';
import { OpenApiParameter } from '../../openApi/src/openApi/v3/interfaces/OpenApiParameter';

export const generateValidMockData = (schema: OpenApiSchema, openApi: OpenApi): any => {
  switch (schema.type) {
    case 'string':
      return faker.lorem.word();
    case 'integer':
    case 'number':
      return random(0, schema.maximum || 100, false);
    case 'boolean':
      return sample([true, false]);
    case 'array':
      let itemSchema = getRef(openApi, schema.items as OpenApiSchema);
      return Array(random(0, schema.maxItems || 5, false)).fill(
        generateValidMockData(itemSchema, openApi),
      );
    case 'object':
      const properties = schema.properties || {};
      const result: any = {};
      for (const [propName, propSchema] of Object.entries(properties)) {
        let resolvedSchema = getRef(openApi, propSchema as OpenApiSchema);
        result[propName] = generateValidMockData(resolvedSchema, openApi);
      }
      return result;
    default:
      return null;
  }
};

export const generateInvalidMockData = (
  schema: OpenApiSchema,
  openApi: OpenApi,
  required: string[] = [],
): any => {
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
      let itemSchema = getRef(openApi, schema.items as OpenApiSchema);
      return schema.maxItems
        ? Array(schema.maxItems + random(1, 5, false)).fill(
            generateValidMockData(itemSchema, openApi),
          )
        : 'invalidArray';
    case 'object':
      const properties = schema.properties || {};
      const result: any = {};
      for (const [propName, propSchema] of Object.entries(properties)) {
        let resolvedSchema = getRef(openApi, propSchema as OpenApiSchema);
        result[propName] = generateInvalidMockData(resolvedSchema, openApi, schema.required);
      }
      if (required.length > 0) delete result[sample(required)!];
      return result;
    default:
      return 'invalidValue';
  }
};

/**
 * Generate a valid value for a parameter based on its schema
 * @param {OpenApiParameter} parameter - The parameter to generate a value for
 * @param openAPISpec
 * @returns {any} - A valid value for the parameter
 */
export const generateValidValue = (parameter: OpenApiParameter, openAPISpec: OpenApi): any => {
  return generateValidMockData(parameter.schema!, openAPISpec);
};
