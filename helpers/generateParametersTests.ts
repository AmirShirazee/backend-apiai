import { capitalizeFirstLetter } from './openApiUtils/capitalizeFirstLetter';
import { findMatchingMethod } from './openApiUtils/findMatchingMethod';
import { generateInvalidMockData, generateValidValue } from './openApiUtils/mockData';
import { CancelablePromise } from './CancelablePromise';
import { OpenApi } from '../openApi/src/openApi/v3/interfaces/OpenApi';
import { OpenApiParameter } from '../openApi/src/openApi/v3/interfaces/OpenApiParameter';
import { OpenApiOperation } from '../openApi/src/openApi/v3/interfaces/OpenApiOperation';

const formatParameterValue = (value: any): string => {
  if (typeof value === 'string') {
    return `'${value}'`;
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  } else {
    return `${value}`;
  }
};

const generateTest = (
  serviceName: string,
  methodName: string,
  parameter: OpenApiParameter,
  value: any,
  openAPISpec: OpenApi,
  success: boolean,
  method: string,
  path: string,
): string => {
  const valueFormatted: string = formatParameterValue(value);
  const endpointName = `${methodName.charAt(0).toUpperCase() + methodName.slice(1)}`;
  const expectedOutcome = success
    ? `should return a successful response when ${parameter.name} is valid`
    : `should return an error - Invalid ${parameter.name}`;

  const testTitle = `${method.toUpperCase()} ${endpointName} (${path}) ${expectedOutcome}`;

  return `test('${testTitle}', async () => {
        const service = ${serviceName}.${methodName};
        const params = { ${parameter.name}: ${valueFormatted} };

        try {
          const result = await service(params);
          ${success ? `expect(result).toBeDefined();` : `fail('Expected error to be thrown');`}
        } catch (error) {
          ${
            success
              ? `expect(error.message).toBe("An unexpected error occurred.");`
              : `expect(error.message).toContain('Invalid parameter ${parameter.name}');`
          }
        }
      });`;
};

const generateTestForParameter = (
  serviceName: string,
  methodName: string,
  parameter: OpenApiParameter,
  method: string,
  path: string,
  openAPISpec: OpenApi,
  valid: boolean,
): string => {
  const value = valid
    ? generateValidValue(parameter, openAPISpec)
    : generateInvalidMockData(parameter.schema!, openAPISpec);
  return generateTest(serviceName, methodName, parameter, value, openAPISpec, valid, method, path);
};

export const generateParametersTests = async (
  operation: OpenApiOperation,
  method: string,
  path: string,
  servicesList: {
    service: string;
    method: string;
    methodFunc: () => CancelablePromise<any>;
  }[],
  openAPISpec: OpenApi,
) => {
  const serviceName: string = `${capitalizeFirstLetter(operation.tags?.[0] ?? '')}Service`;
  const matchingMethodName: string = findMatchingMethod(
    operation.operationId,
    servicesList
      .filter((service): boolean => service.service === serviceName)
      .map((service) => service.method),
  );

  if (!matchingMethodName) {
    throw new Error(`No match found for operationId ${operation.operationId}`);
  }

  if (!operation.parameters) {
    return {
      tests: '',
      usedServices: [],
    };
  }

  const tests: string = (
    await Promise.all(
      operation.parameters.map(async (parameter: OpenApiParameter): Promise<[string]> => {
        const validTest: string = generateTestForParameter(
          serviceName,
          matchingMethodName,
          parameter,
          method,
          path,
          openAPISpec,
          true,
        );
        const invalidTest: string = generateTestForParameter(
          serviceName,
          matchingMethodName,
          parameter,
          method,
          path,
          openAPISpec,
          false,
        );
        return [validTest + invalidTest];
      }),
    )
  )
    .filter(Boolean)
    .join('\n');

  return {
    tests,
    usedServices: [serviceName],
  };
};
