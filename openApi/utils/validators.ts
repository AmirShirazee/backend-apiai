import { OpenApi } from '../src/openApi/v3/interfaces/OpenApi';

export const isValidOpenApiV3 = (obj: any): boolean => {
  if (!obj) return false;
  if (!obj.openapi || !obj.openapi.startsWith("3.")) return false;
  if (!obj.info || typeof obj.info !== "object") return false;
  return !(!obj.paths || typeof obj.paths !== "object");
};

export function isOpenApiSpec(object: any): object is OpenApi {
  return object && object.openapi && object.info && object.paths;
}
