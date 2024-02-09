import { uploadRouter } from "./upload.routes";
import { Express } from "express";
import { healthRouter } from "./health.route";
import jwtMiddleware from "../utils/jwt";

export function initRoutes(app: Express) {
  app.use("/api/upload", jwtMiddleware, uploadRouter);
  app.use("/api/health", jwtMiddleware, healthRouter);
}
