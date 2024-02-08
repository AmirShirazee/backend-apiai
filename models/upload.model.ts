import mongoose, { Model } from 'mongoose';

const uploadSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  openApiVersion: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: String,
    required: true,
    default: getFormattedUploadDate(),
  },
  s3Url: {
    type: String,
    required: true,
  },
});

export interface UploadModel extends mongoose.Document {
  _id: string;
  user: string;
  uploadDate: Date;
  title: string;
  openApiVersion: string;
  s3Url: string;
}

export function getFormattedUploadDate() {
  return new Date().toISOString();
}

export const Upload: Model<UploadModel> =
  (mongoose.models.Upload as Model<UploadModel>) ||
  mongoose.model<UploadModel>('Upload', uploadSchema);

export default Upload;
