"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStatusCodeTests = void 0;
const findMatchingMethod_1 = require("./openApiUtils/findMatchingMethod");
const capitalizeFirstLetter_1 = require("./openApiUtils/capitalizeFirstLetter");
const testGeneration_1 = require("./testGeneration");
/**
 * Filter services and return matching ones based on service name and method name.
 * ..param {Array<Object>} servicesList - List of services
 * ..param {string} serviceName - Name of the service
 * ..param {string} methodName - Name of the method
 * ..returns {Array<Object>} - List of matching services
 */
const filterServices = (servicesList, serviceName, methodName) => {
    return servicesList.filter((service) => service.service === serviceName && service.method === methodName);
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
const generateStatusCodeTests = async (operation, method, path, servicesList, openAPISpec) => {
    var _a, _b;
    const serviceName = `${(0, capitalizeFirstLetter_1.capitalizeFirstLetter)((_b = (_a = operation.tags) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '')}Service`;
    const matchingMethodName = (0, findMatchingMethod_1.findMatchingMethod)(operation.operationId, servicesList
        .filter((service) => service.service === serviceName)
        .map((service) => service.method));
    if (!matchingMethodName) {
        throw new Error(`No match found for operationId ${operation.operationId}`);
    }
    const testsInDescribeBlock = await Promise.all(filterServices(servicesList, serviceName, matchingMethodName).flatMap(({ method: serviceMethodName }) => {
        return Object.entries(operation.responses).map(async ([statusCode, response]) => {
            if ('description' in response && response.description) {
                const test = await (0, testGeneration_1.generateTestForStatusCode)(serviceName, serviceMethodName, operation, method, path, statusCode, response, openAPISpec);
                return { test, statusCode };
            }
            else {
                return { test: null, statusCode };
            }
        });
    }));
    const filteredTests = testsInDescribeBlock.filter((entry) => entry.test != null);
    const testMetadata = filteredTests.map(({ test, statusCode }) => ({
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
exports.generateStatusCodeTests = generateStatusCodeTests;
//# sourceMappingURL=generateStatusCodeTests.js.map