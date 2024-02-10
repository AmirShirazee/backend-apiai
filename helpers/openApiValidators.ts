//@ts-nocheck
import { OpenApiSchema } from '../openApi/src/openApi/v3/interfaces/OpenApiSchema';
import { OpenApi } from '../openApi/src/openApi/v3/interfaces/OpenApi';
import { getRef } from '../openApi/src/openApi/v3/parser/getRef';

const typeAssertions: Record<string, string> = {
  string: "toBe('string')",
  number: "toBe('number')",
  boolean: "toBe('boolean')",
  array: "toBe('object')",
  object: "toBe('object')",
};

const assertResponseValueType = (value: OpenApiSchema, path: string): string => {
  if (typeof value.type !== 'string') return '';

  let assertion = typeAssertions[value.type];

  if (value.type === 'array') {
    assertion += `;\nexpect(Array.isArray(response.body${path})).toBe(true)`;
  }

  return assertion ? `expect(typeof response.body${path}).${assertion};\n` : '';
};

const generateValidationCode = (
  schema: OpenApiSchema,
  openAPISpec: OpenApi,
  path: string = '',
): string => {
  let validationCode = '';

  if (!schema.properties) return validationCode;

  for (const [propertyName, propertyValue] of Object.entries(schema.properties)) {
    const currentPath = `${path}.${propertyName}`;
    const resolvedValue = propertyValue.$ref ? getRef(openAPISpec, propertyValue) : propertyValue;

    validationCode += assertResponseValueType(resolvedValue, currentPath);

    if (
      resolvedValue.type === 'object' ||
      (resolvedValue.type === 'array' && resolvedValue.items)
    ) {
      const newPath = resolvedValue.type === 'array' ? `${currentPath}[0]` : currentPath;
      const nextSchema = resolvedValue.type === 'array' ? resolvedValue.items : resolvedValue;

      validationCode += generateValidationCode(nextSchema!, openAPISpec, newPath);
    }
  }

  return validationCode;
};

export const generateValidation = (
  schema: OpenApiSchema,
  openAPISpec: OpenApi,
  path: string = '',
): string => generateValidationCode(schema, openAPISpec, path);
