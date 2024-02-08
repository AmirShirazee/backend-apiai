import mongoose, { Document, Model, Schema } from "mongoose";

export interface TestFileDocument extends Document {
  s3Key: string;
  user: string;
  createdAt: Date;
}

const TestFileSchema = new Schema<TestFileDocument>({
  s3Key: { type: String, required: true },
  user: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const TestFile: Model<TestFileDocument> =
  (mongoose.models.TestFile as Model<TestFileDocument>) ||
  mongoose.model<TestFileDocument>("TestFile", TestFileSchema);
export default TestFile;
