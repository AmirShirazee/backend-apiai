import { isOpenApiSpec } from '../openApi/utils/validators';

export const validateUploadFile = (uploadFile: any) => {
  if (!isOpenApiSpec(uploadFile)) {
    throw new Error('The uploaded file does not adhere to the OpenAPI v3 specification');
  }
};
