import { uploadRouter } from './upload.routes';
import { Express } from 'express';

export function initRoutes(app: Express) {
  app.use('/api/upload', uploadRouter);
}
