import { uploadRouter } from "./upload.routes";
import { Express } from "express";
import { healthRouter } from "./health.route";
import jwtMiddleware from "../utils/jwt";
import userAuthorizationMiddleware from "../middleware/auth";

export function initRoutes(app: Express) {
  app.use("/api/upload", userAuthorizationMiddleware, uploadRouter);
  app.use("/api/health", userAuthorizationMiddleware, healthRouter);
}
