import { getExampleRequestBody } from './openApiHelpers';
import { generateValidation } from './openApiValidators';
import { OpenApiOperation } from '../openApi/src/openApi/v3/interfaces/OpenApiOperation';
import { OpenApiSchema } from '../openApi/src/openApi/v3/interfaces/OpenApiSchema';
import { OpenApi } from '../openApi/src/openApi/v3/interfaces/OpenApi';
import { getRef } from '../openApi/src/openApi/v3/parser/getRef';
import { OpenApiResponse } from '../openApi/src/openApi/v3/interfaces/OpenApiResponse';

export const isSuccessStatusCode = (statusCodeNum: number): boolean =>
  statusCodeNum >= 200 && statusCodeNum < 300;

const isMethodWithRequestBody = (method: string): boolean =>
  ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase());

const generateResponseInvocation = (
  serviceName: string,
  serviceMethodName: string,
  operation: OpenApiOperation,
  method: string,
): string =>
  `await ${serviceName}.${serviceMethodName}${
    isMethodWithRequestBody(method) ? '(requestBody)' : '()'
  }`;

const generateResponseBodyValidation = (
  responseSchema: OpenApiSchema | null,
  openAPISpec: OpenApi,
): string => {
  if (!responseSchema) return '';
  return generateValidation(getRef(openAPISpec, responseSchema), openAPISpec);
};

const generateTestBody = (
  statusCodeNum: number,
  responseInvocation: string,
  responseBodyValidationCode: string,
): string => {
  if (isSuccessStatusCode(statusCodeNum)) {
    return `
      try {
        const response = ${responseInvocation};
        expect(response.status).toEqual(${statusCodeNum});
        ${responseBodyValidationCode}
      } catch (error) {
        console.error(error);
        throw error;
      }
    `;
  }

  return `
    expect(() => ${responseInvocation}).toThrowError(error => {
      expect(error).toBeInstanceOf(Error);
      if (error.response) {
        expect(error.response.status).toEqual(${statusCodeNum});
        ${responseBodyValidationCode}
      } else {
        expect(error.message).toBe('An unexpected error occurred.');
      }
    });
  `;
};

const generateRequestBodyPart = async (
  operation: OpenApiOperation,
  method: string,
  openAPISpec: OpenApi,
  statusCodeNum: number,
): Promise<string> => {
  if (!isMethodWithRequestBody(method)) return '';
  const example = await getExampleRequestBody(operation.operationId!, openAPISpec, statusCodeNum);
  if (!example) return '';
  return `const requestBody = ${JSON.stringify(example, null, 2)};`;
};

export const generateTestForStatusCode = async (
  serviceName: string,
  serviceMethodName: string,
  operation: OpenApiOperation,
  method: string,
  path: string,
  statusCode: string,
  response: OpenApiResponse,
  openAPISpec: OpenApi,
): Promise<string> => {
  const responseDescription = response.description ? ` - ${response.description}` : '';

  return `test('${method.toUpperCase()} ${
    operation.operationId
  } (${path}) should return ${statusCode}${responseDescription}', async () => { ${await generateRequestBodyPart(
    operation,
    method,
    openAPISpec,
    parseInt(statusCode, 10),
  )} ${generateTestBody(
    parseInt(statusCode, 10),
    generateResponseInvocation(serviceName, serviceMethodName, operation, method),
    generateResponseBodyValidation(response.content?.['application/json']?.schema!, openAPISpec),
  )} });`;
};
