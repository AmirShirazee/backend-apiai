import { OpenApi } from '../openApi/src/openApi/v3/interfaces/OpenApi';

export interface OpenApiUploadResult {
  userId: string;
  spec: OpenApi; // Assuming OpenAPI is a type you've defined elsewhere
  s3Url: string;
  status: string;
  message: string;
}

export interface ServiceUploadResult {
  s3Url: string;
  spec: OpenApi;
}
