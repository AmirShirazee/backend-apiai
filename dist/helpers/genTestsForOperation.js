"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestsForOperation = void 0;
const generateParametersTests_1 = require("./generateParametersTests");
const generateStatusCodeTests_1 = require("./generateStatusCodeTests");
async function generateTest(testGeneratorFunc, args) {
    return testGeneratorFunc(...args);
}
function collectUsedServices(...testResults) {
    return [...new Set(testResults.flatMap((result) => result.usedServices))];
}
const generateTestsForOperation = async (operation, method, path, servicesList, openAPISpec) => {
    const testGenerators = [generateStatusCodeTests_1.generateStatusCodeTests, generateParametersTests_1.generateParametersTests];
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
exports.generateTestsForOperation = generateTestsForOperation;
//# sourceMappingURL=genTestsForOperation.js.map