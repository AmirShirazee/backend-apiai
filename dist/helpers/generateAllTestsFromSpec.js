"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAllTestsFromSpec = void 0;
const getServices_1 = require("./openApiUtils/getServices");
const generateImportStatement_1 = require("./openApiUtils/generateImportStatement");
const formatTests_1 = require("./openApiUtils/formatTests");
const genTestsForOperation_1 = require("./genTestsForOperation");
const generateAllTestsFromSpec = async (openApiSpec, directory) => {
    let servicesList;
    try {
        servicesList = await (0, getServices_1.getServicesList)(directory);
    }
    catch (error) {
        console.error(`Error getting services list from directory ${directory}:`, error);
        throw new Error(`Failed to get services list: ${error.message}`);
    }
    const serviceImports = new Set();
    const tests = new Map();
    let allTestMetadata = [];
    try {
        for (const pathKey of Object.keys(openApiSpec.paths)) {
            for (const method of Object.keys(openApiSpec.paths[pathKey])) {
                const operationResult = await handleOperation(openApiSpec, pathKey, method, servicesList);
                operationResult.usedServices.forEach((service) => {
                    serviceImports.add(service);
                });
                allTestMetadata = allTestMetadata.concat(operationResult.allTestMetadata);
                for (const test of operationResult.describeBlock) {
                    const match = test.match(/describe\('(.*)',/);
                    if (match && match[1]) {
                        const testTitle = match[1];
                        if (!tests.has(testTitle)) {
                            tests.set(testTitle, test);
                        }
                        else {
                            console.log(`Test already exists: ${testTitle}`);
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Error during the test generation process:', error);
        throw new Error(`Test generation process failed: ${error.message}`);
    }
    let importStatement;
    try {
        importStatement = (0, generateImportStatement_1.generateImportStatement)(serviceImports);
    }
    catch (error) {
        console.error('Error generating import statement:', error);
        throw new Error(`Import statement generation failed: ${error.message}`);
    }
    let formattedTests;
    try {
        formattedTests = await (0, formatTests_1.formatTests)(tests);
    }
    catch (error) {
        console.error('Error formatting tests:', error);
        throw new Error(`Test formatting failed: ${error.message}`);
    }
    return { importStatement, formattedTests, allTestMetadata };
};
exports.generateAllTestsFromSpec = generateAllTestsFromSpec;
const handleOperation = async (openApiSpec, pathKey, method, servicesList) => {
    const operation = openApiSpec.paths[pathKey][method];
    return await (0, genTestsForOperation_1.generateTestsForOperation)(operation, method, pathKey, servicesList, openApiSpec);
};
//# sourceMappingURL=generateAllTestsFromSpec.js.map