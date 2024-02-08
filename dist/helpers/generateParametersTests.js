"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateParametersTests = void 0;
const capitalizeFirstLetter_1 = require("./openApiUtils/capitalizeFirstLetter");
const findMatchingMethod_1 = require("./openApiUtils/findMatchingMethod");
const mockData_1 = require("./openApiUtils/mockData");
const formatParameterValue = (value) => {
    if (typeof value === 'string') {
        return `'${value}'`;
    }
    else if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    else {
        return `${value}`;
    }
};
const generateTest = (serviceName, methodName, parameter, value, openAPISpec, success, method, path) => {
    const valueFormatted = formatParameterValue(value);
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
          ${success
        ? `expect(error.message).toBe("An unexpected error occurred.");`
        : `expect(error.message).toContain('Invalid parameter ${parameter.name}');`}
        }
      });`;
};
const generateTestForParameter = (serviceName, methodName, parameter, method, path, openAPISpec, valid) => {
    const value = valid
        ? (0, mockData_1.generateValidValue)(parameter, openAPISpec)
        : (0, mockData_1.generateInvalidMockData)(parameter.schema, openAPISpec);
    return generateTest(serviceName, methodName, parameter, value, openAPISpec, valid, method, path);
};
const generateParametersTests = async (operation, method, path, servicesList, openAPISpec) => {
    var _a, _b;
    const serviceName = `${(0, capitalizeFirstLetter_1.capitalizeFirstLetter)((_b = (_a = operation.tags) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '')}Service`;
    const matchingMethodName = (0, findMatchingMethod_1.findMatchingMethod)(operation.operationId, servicesList
        .filter((service) => service.service === serviceName)
        .map((service) => service.method));
    if (!matchingMethodName) {
        throw new Error(`No match found for operationId ${operation.operationId}`);
    }
    if (!operation.parameters) {
        return {
            tests: '',
            usedServices: [],
        };
    }
    const tests = (await Promise.all(operation.parameters.map(async (parameter) => {
        const validTest = generateTestForParameter(serviceName, matchingMethodName, parameter, method, path, openAPISpec, true);
        const invalidTest = generateTestForParameter(serviceName, matchingMethodName, parameter, method, path, openAPISpec, false);
        return [validTest + invalidTest];
    })))
        .filter(Boolean)
        .join('\n');
    return {
        tests,
        usedServices: [serviceName],
    };
};
exports.generateParametersTests = generateParametersTests;
//# sourceMappingURL=generateParametersTests.js.map