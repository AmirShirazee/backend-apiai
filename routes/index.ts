import { uploadRouter } from './upload.routes';
import { Express } from 'express';
import {healthRouter} from "./health.route";

export function initRoutes(app: Express) {
  app.use('/api/upload', uploadRouter);
  app.use('/api/health', healthRouter);
}
