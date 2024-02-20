import { findMatchingMethod } from './openApiUtils/findMatchingMethod';
import { capitalizeFirstLetter } from './openApiUtils/capitalizeFirstLetter';
import { generateTestForStatusCode } from './testGeneration';
import { OpenApiOperation } from '../openApi/src/openApi/v3/interfaces/OpenApiOperation';
import { OpenApi } from '../openApi/src/openApi/v3/interfaces/OpenApi';
import { OpenApiResponse } from '../openApi/src/openApi/v3/interfaces/OpenApiResponse';
import { ServiceListType } from '../types/servicelist.types';

/**
 * Filter services and return matching ones based on service name and method name.
 * ..param {Array<Object>} servicesList - List of services
 * ..param {string} serviceName - Name of the service
 * ..param {string} methodName - Name of the method
 * ..returns {Array<Object>} - List of matching services
 */
const filterServices = (
  servicesList: ServiceListType[],
  serviceName: string,
  methodName: string,
): ServiceListType[] => {
  return servicesList.filter(
    (service: ServiceListType) => service.service === serviceName && service.method === methodName,
  );
};

/**
 * Generate a list of tests for a given operation, method, path, list of services and OpenAPI specification.
 * ..param {OpenApiOperation} operation - The operation to generate tests for
 * ..param {string} method - The HTTP method
 * ..param {string} path - The path of the operation
 * ..param {Array<Object>} servicesList - List of services
 * ..param openAPISpec
 * ..returns {Promise<Object>} - An object containing a list of tests and a list of used services
 */
export const generateStatusCodeTests = async (
  operation: OpenApiOperation,
  method: string,
  path: string,
  servicesList: ServiceListType[],
  openAPISpec: OpenApi,
): Promise<{
  tests: string;
  usedServices: string[];
  testMetadata: TestMetadata[];
}> => {
  const serviceName: string = `${capitalizeFirstLetter(operation.tags?.[0] ?? '')}Service`;
  const matchingMethodName: string = findMatchingMethod(
    operation.operationId,
    servicesList
      .filter((service: ServiceListType): boolean => service.service === serviceName)
      .map((service: ServiceListType) => service.method),
  );

  if (!matchingMethodName) {
    throw new Error(`No match found for operationId ${operation.operationId}`);
  }

  const testsInDescribeBlock: { test: string | null; statusCode: string }[] = await Promise.all(
    filterServices(servicesList, serviceName, matchingMethodName).flatMap(
      ({ method: serviceMethodName }) => {
        return Object.entries(operation.responses).map(async ([statusCode, response]) => {
          if ('description' in response && response.description) {
            const test = await generateTestForStatusCode(
              serviceName,
              serviceMethodName,
              operation,
              method,
              path,
              statusCode,
              response as OpenApiResponse,
              openAPISpec,
            );
            return { test, statusCode };
          } else {
            return { test: null, statusCode };
          }
        });
      },
    ),
  );

  const filteredTests = testsInDescribeBlock.filter((entry) => entry.test != null);

  const testMetadata: TestMetadata[] = filteredTests.map(({ test, statusCode }) => ({
    operationId: operation.operationId,
    method,
    statusCode,
    testType: 'statusCode',
  }));

  const totalTests = filteredTests.length;
  console.log(`Generated ${totalTests} tests for ${path} ${method}`);

  return {
    tests: filteredTests.map((entry) => entry.test).join('\n'),
    usedServices: [serviceName],
    testMetadata,
  };
};

export type TestMetadata = {
  operationId: string | undefined;
  method: string;
  statusCode: string;
  testType: 'statusCode';
};
