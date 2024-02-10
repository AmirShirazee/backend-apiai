import { generateInvalidMockData, generateValidMockData } from './mockData';
import { OpenApiOperation } from '../../openApi/src/openApi/v3/interfaces/OpenApiOperation';
import { OpenApi } from '../../openApi/src/openApi/v3/interfaces/OpenApi';
import { getRef } from '../../openApi/src/openApi/v3/parser/getRef';

const isOperationObject = (obj: any): obj is OpenApiOperation => {
  return obj && obj.hasOwnProperty('operationId');
};

/**
 * Helper function to extract operation from the OpenAPI specification.
 * @param {OpenApi} openapiSpec - OpenAPI specification
 * @param {string} operationId - Operation id to match
 * @returns {OpenApiOperation | null} - Returns the matched operation or null
 */
const getOperation = (openapiSpec: OpenApi, operationId: string): OpenApiOperation | null => {
  for (const pathItem of Object.values(openapiSpec.paths)) {
    for (const operation of Object.values(pathItem!)) {
      if (isOperationObject(operation) && operation.operationId === operationId) {
        return operation;
      }
    }
  }
  return null;
};

/**
 * Get example request body for a given operation id and OpenAPI specification.
 * @param {string} operationId - Operation id
 * @param {string} file - OpenAPI specification file name
 * @param {number} [forStatusCode] - Status code
 * @returns {Promise<any>} - Returns example request body or mock data
 */
export const getExampleRequestBody = async (
  operationId: string,
  file: OpenApi,
  forStatusCode?: number,
) => {
  const operation = getOperation(file, operationId);

  if (!operation) return null;

  const example = operation.requestBody?.content['application/json']?.example;

  if (example) return example;

  let schema = operation.requestBody?.content['application/json']?.schema;

  if (!schema) return null;

  // Resolve $ref if it exists in the schema
  schema = getRef(file, schema);

  if (forStatusCode) {
    let mockData;
    if (forStatusCode >= 200 && forStatusCode < 300) {
      mockData = generateValidMockData(schema, file);
    } else if (forStatusCode >= 400 && forStatusCode < 500) {
      mockData = generateInvalidMockData(schema, file);
    }

    if (mockData) return mockData;
  }

  return null;
};
