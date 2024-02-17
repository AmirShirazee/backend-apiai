import { Router } from "express";
import {
  deleteUpload,
  getUpload,
  getUploads,
  uploadController,
} from "../controllers/upload.controller";
import userAuthorizationMiddleware from "../middleware/auth";

const router = Router();
router.get("/", userAuthorizationMiddleware, (req, res) => {
  res.status(200).json({ message: "Server is correctly protected!" });
});
router.post("/:user", uploadController).get("/:user", getUploads);
router.get("/:user/:id", getUpload).delete("/:user", deleteUpload);

export { router as uploadRouter };
