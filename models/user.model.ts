import mongoose, { Document, model, Model, Schema } from 'mongoose';
import { omit } from 'ramda';
import bcrypt from 'bcryptjs';

export interface UserModel extends Model<UserDocument> {
  findByToken(
    tokenObject: { token: string },
    callback: (err: Error | null, user: UserModel | false) => void,
  ): void;
}

interface EditorSettings {
  readOnly: boolean;
  showLineNumbers: boolean;
  tabSize: number;
  useWorker: boolean;
  displayIndentGuides: boolean;
  highlightActiveLine: boolean;
  highlightSelectedWord: boolean;
}

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date | null; // Allow null value
  isVerified: boolean;
  isAdmin: boolean;
  token: string;
  didUpload: boolean;
  editorSettings: EditorSettings;
  project: boolean;
  comparePassword(password: string): Promise<boolean>;
  sanitizeUser(): void;
  getTestFileContent(): string;
  hashPassword(): Promise<string>;
  passwordResetAttempts: {
    timestamps: Date[];
    count: number;
    lastEvaluated: Date;
  };
  uploadedAtDate: {
    type: string;
    default: null;
  };
}

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
    validate: {
      validator: function (v: string) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Date, default: null },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  didUpload: {
    type: Boolean,
    default: false,
  },
  uploadedAtDate: {
    type: Date,
    default: null,
  },

  project: {
    type: Boolean,
    default: false,
  },
  passwordResetAttempts: {
    timestamps: { type: [Date], default: [] },
    count: { type: Number, default: 0 },
    lastEvaluated: { type: Date, default: new Date(0) },
  },
  editorSettings: {
    readOnly: { type: Boolean, default: true },
    showLineNumbers: { type: Boolean, default: true },
    tabSize: { type: Number, default: 2 },
    useWorker: { type: Boolean, default: false },
    displayIndentGuides: { type: Boolean, default: true },
    highlightActiveLine: { type: Boolean, default: false },
    highlightSelectedWord: { type: Boolean, default: false },
  },
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.hashPassword = async function () {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err1, salt) => {
      if (err1) {
        reject(new Error('Failed to generate salt.'));
        return;
      }
      bcrypt.hash(this.password, salt, (err2, hash) => {
        if (err2) {
          reject(new Error('Failed to hash password.'));
          return;
        }
        this.password = hash;
        resolve(hash);
      });
    });
  });
};

userSchema.methods.sanitizeUser = function () {
  return omit(['password', '__v', '_id'], this.toObject({ virtuals: true }));
};

userSchema.statics.findByToken = function (
  tokenObject: { token: string },
  callback: (err: Error | null, user?: UserDocument | null) => void,
) {
  return this.findOne({ token: tokenObject.token }, callback);
};

export const User: UserModel =
  (mongoose.models.User as UserModel) || model<UserDocument, UserModel>('User', userSchema);

export default User;
