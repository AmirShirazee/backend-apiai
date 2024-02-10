import { Router } from "express";
import {
  deleteUpload,
  getUpload,
  getUploads,
  uploadController,
} from "../controllers/upload.controller";

const router = Router();

router.post("/:user", uploadController).get("/:user", getUploads);
router.get("/:user/:id", getUpload).delete("/:user", deleteUpload);

export { router as uploadRouter };
