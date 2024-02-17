import { uploadRouter } from "./upload.routes";
import { Express } from "express";
import userAuthorizationMiddleware from "../middleware/auth";

export function initRoutes(app: Express) {
  app.use("/backend/api/upload", userAuthorizationMiddleware, uploadRouter);
}
