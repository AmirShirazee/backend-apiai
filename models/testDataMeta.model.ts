import mongoose, { Model } from "mongoose";

const testMetadataSchema = new mongoose.Schema({
  operationId: { type: String, default: null },
  method: { type: String, required: true },
  statusCode: { type: String, required: true },
  testType: { type: String, required: true },
});

export const TestData: Model<ITestMetadata> =
  (mongoose.models.TestMetadata as Model<ITestMetadata>) ||
  mongoose.model<ITestMetadata>("TestData", testMetadataSchema);

export interface ITestMetadata {
  operationId?: string; // Optional
  method: string;
  statusCode: string;
  testType: string;
}
