import { generateParametersTests } from './generateParametersTests';
import { generateStatusCodeTests, TestMetadata } from './generateStatusCodeTests';
import { CancelablePromise } from './CancelablePromise';
import { OpenApiOperation } from '../openApi/src/openApi/v3/interfaces/OpenApiOperation';
import { OpenApi } from '../openApi/src/openApi/v3/interfaces/OpenApi';

type ServiceDefinition = {
  service: string;
  method: string;
  methodFunc: () => CancelablePromise<any>;
};

async function generateTest(testGeneratorFunc: Function, args: any[]): Promise<any> {
  return testGeneratorFunc(...args);
}

function collectUsedServices(...testResults: { usedServices: string[] }[]): string[] {
  return [...new Set(testResults.flatMap((result) => result.usedServices))];
}

export const generateTestsForOperation = async (
  operation: OpenApiOperation,
  method: string,
  path: string,
  servicesList: ServiceDefinition[],
  openAPISpec: OpenApi,
): Promise<{
  describeBlock: string[];
  usedServices: string[];
  allTestMetadata: TestMetadata[];
}> => {
  const testGenerators = [generateStatusCodeTests, generateParametersTests];
  const args = [operation, method, path, servicesList, openAPISpec];

  const testResults = await Promise.all(testGenerators.map((func) => generateTest(func, args)));

  const tests = testResults.map((result) => result.tests).join('\n\n');
  const usedServices = collectUsedServices(...testResults);
  const allTestMetadata = testResults.flatMap((result) => result.testMetadata);

  return {
    describeBlock: [`describe('${operation.operationId}', () => {\n${tests}\n});`],
    usedServices,
    allTestMetadata,
  };
};
