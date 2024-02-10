// import * as fc from 'fast-check';
// import { capitalizeFirstLetter } from '../utils/openApiUtils/capitalizeFirstLetter';
// import { OpenApiOperation } from '../../openApi/src/openApi/v3/interfaces/OpenApiOperation';
// import { ServiceListType } from '../types/servicelist.types';
// import { OpenApiSchema } from '../../openApi/src/openApi/v3/interfaces/OpenApiSchema';
// import { OpenApi } from '../../openApi/src/openApi/v3/interfaces/OpenApi';
// import { getRef } from '../../openApi/src/openApi/v3/parser/getRef';
//
// type OpenApiType = 'integer' | 'number' | 'string' | 'boolean' | 'object' | 'array' | '$ref';
//
// const typeToArbitrary: {
//   [type in OpenApiType]: (
//     property: OpenApiSchema,
//     openAPISpec: OpenApi,
//     requiredFields: string[],
//   ) => fc.Arbitrary<any>;
// } = {
//   integer: (property) =>
//     fc.integer({ min: property.minimum ?? -10000, max: property.maximum ?? 10000 }),
//   number: (property) =>
//     fc.float({ min: property.minimum ?? -10000, max: property.maximum ?? 10000 }),
//   string: (property) =>
//     fc.string({ minLength: property.minLength ?? 0, maxLength: property.maxLength ?? 100 }),
//   boolean: () => fc.boolean(),
//   object: (property, openAPISpec, requiredFields = []) => {
//     if (property.properties) {
//       const properties = Object.fromEntries(
//         Object.entries(property.properties)
//           .filter(([key, prop]) => {
//             const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type ?? '$ref';
//             return typeToArbitrary.hasOwnProperty(propType);
//           })
//           .map(([key, prop]: [string, OpenApiSchema]) => {
//             const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type ?? '$ref';
//             const isRequired = Array.isArray(requiredFields) && requiredFields.includes(key);
//             return [key, typeToArbitrary[propType](prop, openAPISpec, isRequired ? [key] : [])];
//           }),
//       );
//
//       // Only keep required fields that exist in properties
//       const validRequiredFields = requiredFields.filter((key) => key in properties);
//
//       return fc.record(properties, { requiredKeys: validRequiredFields });
//     }
//     return fc.object();
//   },
//
//   array: (property, openAPISpec) => {
//     if (property.items) {
//       const itemType = Array.isArray(property.items.type)
//         ? property.items.type[0]
//         : property.items.type ?? '$ref';
//       return fc.array(typeToArbitrary[itemType](property.items, openAPISpec));
//     }
//     return fc.array(fc.anything());
//   },
//   $ref: (property, openAPISpec) => {
//     const schema = getRef(openAPISpec, property);
//     const requiredFields = schema.required ?? [];
//     const propType = Array.isArray(schema.type) ? schema.type[0] : schema.type ?? '$ref';
//     return typeToArbitrary[propType](schema, openAPISpec, requiredFields);
//   },
// };
//
// export const generateFastCheckTests = (
//   operation: OpenApiOperation,
//   servicesList: ServiceListType[],
//   openAPISpec: OpenApi,
// ) => {
//   let schema = operation.requestBody?.content?.['application/json']?.schema;
//
//   if (!schema) {
//     console.log(`No schema found for operation ${operation.operationId}`);
//     return { test: '', usedServices: [] };
//   }
//
//   if ('$ref' in schema) {
//     schema = getRef(openAPISpec, schema);
//   }
//
//   if (!schema || schema.type !== 'object' || !schema.properties) {
//     console.log(`No schema found for operation ${operation.operationId}`);
//     return { test: '', usedServices: [] };
//   }
//
//   const requiredFields = schema.required ?? [];
//   const properties = Object.fromEntries(
//     Object.entries(schema.properties)
//       .filter(([key, prop]: [string, OpenApiSchema]) => {
//         const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type ?? '$ref';
//         return typeToArbitrary.hasOwnProperty(propType);
//       })
//       .map(([key, prop]: [string, OpenApiSchema]) => {
//         const propType = Array.isArray(prop.type) ? prop.type[0] : prop.type ?? '$ref';
//         return [key, typeToArbitrary[propType](prop, openAPISpec, requiredFields.includes(key))];
//       }),
//   );
//
//   const serviceName = `${capitalizeFirstLetter(operation.tags?.[0] ?? '')}Service`;
//   const service = servicesList.find((service) => service.service === serviceName);
//
//   if (!service) {
//     throw new Error(`No service found for tag ${operation.tags?.[0]}`);
//   }
//
//   const test = `
//     test('${operation.operationId} should always respond with a valid status code', () => {
//       fc.assert(
//         fc.property(fc.record(${JSON.stringify(properties)}), async (requestBody) => {
//           const response = await ${serviceName}['${service.method}'](requestBody);
//           expect(response.statusCode).toBeLessThan(500);
//         }),
//         { numRuns: 100 }
//       );
//     });
//   `;
//
//   return {
//     test,
//     usedServices: [serviceName],
//   };
// };
