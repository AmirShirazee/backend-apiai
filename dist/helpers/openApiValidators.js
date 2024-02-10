"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateValidation = void 0;
const getRef_1 = require("../openApi/src/openApi/v3/parser/getRef");
const typeAssertions = {
    string: "toBe('string')",
    number: "toBe('number')",
    boolean: "toBe('boolean')",
    array: "toBe('object')",
    object: "toBe('object')",
};
const assertResponseValueType = (value, path) => {
    if (typeof value.type !== 'string')
        return '';
    let assertion = typeAssertions[value.type];
    if (value.type === 'array') {
        assertion += `;\nexpect(Array.isArray(response.body${path})).toBe(true)`;
    }
    return assertion ? `expect(typeof response.body${path}).${assertion};\n` : '';
};
const generateValidationCode = (schema, openAPISpec, path = '') => {
    let validationCode = '';
    if (!schema.properties)
        return validationCode;
    for (const [propertyName, propertyValue] of Object.entries(schema.properties)) {
        const currentPath = `${path}.${propertyName}`;
        const resolvedValue = propertyValue.$ref ? (0, getRef_1.getRef)(openAPISpec, propertyValue) : propertyValue;
        validationCode += assertResponseValueType(resolvedValue, currentPath);
        if (resolvedValue.type === 'object' ||
            (resolvedValue.type === 'array' && resolvedValue.items)) {
            const newPath = resolvedValue.type === 'array' ? `${currentPath}[0]` : currentPath;
            const nextSchema = resolvedValue.type === 'array' ? resolvedValue.items : resolvedValue;
            validationCode += generateValidationCode(nextSchema, openAPISpec, newPath);
        }
    }
    return validationCode;
};
const generateValidation = (schema, openAPISpec, path = '') => generateValidationCode(schema, openAPISpec, path);
exports.generateValidation = generateValidation;
//# sourceMappingURL=openApiValidators.js.map