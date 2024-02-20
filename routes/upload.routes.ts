import { Router } from "express";
import {
  deleteUpload,
  getUpload,
  getUploads,
  uploadController,
} from "../controllers/upload.controller";
import userAuthorizationMiddleware from "../middleware/auth";

const router = Router();

router
  .post("/:user", uploadController)
  .get("/:user", userAuthorizationMiddleware, getUploads);
router
  .get("/:user/:id", userAuthorizationMiddleware, getUpload)
  .delete("/:user", userAuthorizationMiddleware, deleteUpload);

export { router as uploadRouter };
