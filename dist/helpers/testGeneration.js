"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestForStatusCode = exports.isSuccessStatusCode = void 0;
const openApiHelpers_1 = require("./openApiHelpers");
const openApiValidators_1 = require("./openApiValidators");
const getRef_1 = require("../openApi/src/openApi/v3/parser/getRef");
const isSuccessStatusCode = (statusCodeNum) => statusCodeNum >= 200 && statusCodeNum < 300;
exports.isSuccessStatusCode = isSuccessStatusCode;
const isMethodWithRequestBody = (method) => ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase());
const generateResponseInvocation = (serviceName, serviceMethodName, operation, method) => `await ${serviceName}.${serviceMethodName}${isMethodWithRequestBody(method) ? '(requestBody)' : '()'}`;
const generateResponseBodyValidation = (responseSchema, openAPISpec) => {
    if (!responseSchema)
        return '';
    return (0, openApiValidators_1.generateValidation)((0, getRef_1.getRef)(openAPISpec, responseSchema), openAPISpec);
};
const generateTestBody = (statusCodeNum, responseInvocation, responseBodyValidationCode) => {
    if ((0, exports.isSuccessStatusCode)(statusCodeNum)) {
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
const generateRequestBodyPart = async (operation, method, openAPISpec, statusCodeNum) => {
    if (!isMethodWithRequestBody(method))
        return '';
    const example = await (0, openApiHelpers_1.getExampleRequestBody)(operation.operationId, openAPISpec, statusCodeNum);
    if (!example)
        return '';
    return `const requestBody = ${JSON.stringify(example, null, 2)};`;
};
const generateTestForStatusCode = async (serviceName, serviceMethodName, operation, method, path, statusCode, response, openAPISpec) => {
    var _a, _b;
    const responseDescription = response.description ? ` - ${response.description}` : '';
    return `test('${method.toUpperCase()} ${operation.operationId} (${path}) should return ${statusCode}${responseDescription}', async () => { ${await generateRequestBodyPart(operation, method, openAPISpec, parseInt(statusCode, 10))} ${generateTestBody(parseInt(statusCode, 10), generateResponseInvocation(serviceName, serviceMethodName, operation, method), generateResponseBodyValidation((_b = (_a = response.content) === null || _a === void 0 ? void 0 : _a['application/json']) === null || _b === void 0 ? void 0 : _b.schema, openAPISpec))} });`;
};
exports.generateTestForStatusCode = generateTestForStatusCode;
//# sourceMappingURL=testGeneration.js.map