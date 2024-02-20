import mongoose, { Model } from "mongoose";

export interface IProject extends mongoose.Document {
  user: string;
  project: Buffer;
}

const ProjectSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  project: {
    type: Buffer,
    required: true,
  },
});

export const ProjectModel: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default ProjectModel;
