import { getServicesList } from './openApiUtils/getServices';
import { generateImportStatement } from './openApiUtils/generateImportStatement';
import { formatTests } from './openApiUtils/formatTests';
import { generateTestsForOperation } from './genTestsForOperation';
import { TestMetadata } from './generateStatusCodeTests';
import { OpenApi } from '../openApi/src/openApi/v3/interfaces/OpenApi';
import { OpenApiOperation } from '../openApi/src/openApi/v3/interfaces/OpenApiOperation';

export const generateAllTestsFromSpec = async (
  openApiSpec: OpenApi,
  directory: string,
): Promise<{
  importStatement: string;
  formattedTests: string;
  allTestMetadata: TestMetadata[];
}> => {
  let servicesList;
  try {
    servicesList = await getServicesList(directory);
  } catch (error: any) {
    console.error(`Error getting services list from directory ${directory}:`, error);
    throw new Error(`Failed to get services list: ${error.message}`);
  }

  const serviceImports = new Set<string>();
  const tests: Map<string, string> = new Map();
  let allTestMetadata: TestMetadata[] = [];

  try {
    for (const pathKey of Object.keys(openApiSpec.paths)) {
      for (const method of Object.keys(openApiSpec.paths[pathKey])) {
        const operationResult = await handleOperation(openApiSpec, pathKey, method, servicesList);

        operationResult.usedServices.forEach((service) => {
          serviceImports.add(service);
        });

        allTestMetadata = allTestMetadata.concat(operationResult.allTestMetadata);

        for (const test of operationResult.describeBlock) {
          const match: RegExpMatchArray | null = test.match(/describe\('(.*)',/);
          if (match && match[1]) {
            const testTitle: string = match[1];
            if (!tests.has(testTitle)) {
              tests.set(testTitle, test);
            } else {
              console.log(`Test already exists: ${testTitle}`);
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Error during the test generation process:', error);
    throw new Error(`Test generation process failed: ${error.message}`);
  }

  let importStatement;
  try {
    importStatement = generateImportStatement(serviceImports);
  } catch (error: any) {
    console.error('Error generating import statement:', error);
    throw new Error(`Import statement generation failed: ${error.message}`);
  }

  let formattedTests;
  try {
    formattedTests = await formatTests(tests);
  } catch (error: any) {
    console.error('Error formatting tests:', error);
    throw new Error(`Test formatting failed: ${error.message}`);
  }

  return { importStatement, formattedTests, allTestMetadata };
};

const handleOperation = async (
  openApiSpec: OpenApi,
  pathKey: string,
  method: string,
  servicesList: any[],
) => {
  const operation = (openApiSpec.paths[pathKey] as any)[method] as OpenApiOperation;

  return await generateTestsForOperation(operation, method, pathKey, servicesList, openApiSpec);
};
