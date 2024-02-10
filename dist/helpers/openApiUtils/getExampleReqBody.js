"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExampleRequestBody = void 0;
const mockData_1 = require("./mockData");
const getRef_1 = require("../../openApi/src/openApi/v3/parser/getRef");
const isOperationObject = (obj) => {
    return obj && obj.hasOwnProperty('operationId');
};
/**
 * Helper function to extract operation from the OpenAPI specification.
 * @param {OpenApi} openapiSpec - OpenAPI specification
 * @param {string} operationId - Operation id to match
 * @returns {OpenApiOperation | null} - Returns the matched operation or null
 */
const getOperation = (openapiSpec, operationId) => {
    for (const pathItem of Object.values(openapiSpec.paths)) {
        for (const operation of Object.values(pathItem)) {
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
const getExampleRequestBody = async (operationId, file, forStatusCode) => {
    var _a, _b, _c, _d;
    const operation = getOperation(file, operationId);
    if (!operation)
        return null;
    const example = (_b = (_a = operation.requestBody) === null || _a === void 0 ? void 0 : _a.content['application/json']) === null || _b === void 0 ? void 0 : _b.example;
    if (example)
        return example;
    let schema = (_d = (_c = operation.requestBody) === null || _c === void 0 ? void 0 : _c.content['application/json']) === null || _d === void 0 ? void 0 : _d.schema;
    if (!schema)
        return null;
    // Resolve $ref if it exists in the schema
    schema = (0, getRef_1.getRef)(file, schema);
    if (forStatusCode) {
        let mockData;
        if (forStatusCode >= 200 && forStatusCode < 300) {
            mockData = (0, mockData_1.generateValidMockData)(schema, file);
        }
        else if (forStatusCode >= 400 && forStatusCode < 500) {
            mockData = (0, mockData_1.generateInvalidMockData)(schema, file);
        }
        if (mockData)
            return mockData;
    }
    return null;
};
exports.getExampleRequestBody = getExampleRequestBody;
//# sourceMappingURL=getExampleReqBody.js.map