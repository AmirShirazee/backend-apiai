import { UserDocument } from '@/models/user.model.js';

declare module './express' {
  export interface Request {
    user?: any;
    session?: any;
    sessionID?: string;
    mdContent?: string;
  }

  interface User extends UserDocument {}
}
