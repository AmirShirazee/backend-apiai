import { uploadRouter } from "./upload.routes";
import { Express } from "express";
import userAuthorizationMiddleware from "../middleware/auth";
import { healthRouter } from "./health.routes";

export function initRoutes(app: Express) {
  app.use("/backend/api/upload", userAuthorizationMiddleware, uploadRouter);
  app.use("/backend/api/health", healthRouter);
}
