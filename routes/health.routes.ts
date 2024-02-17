import { Router } from "express";
const router = Router();
import { Request, Response } from "express";
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running!" });
});

export { router as healthRouter };
