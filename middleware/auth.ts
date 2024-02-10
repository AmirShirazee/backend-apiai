import { Request, Response, NextFunction } from "express";
import jwtMiddleware from "../utils/jwt";

interface AuthRequest extends Request {
  auth?: { id?: string }; // Extend the Request type to include possible auth object
  userId?: string; // Include the userId field that we will add
}

const userAuthorizationMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Validate the token first
  jwtMiddleware(req, res, () => {
    // After jwtMiddleware, the token's payload should be available in req.auth
    const tokenUserId = req.auth?.id;

    // If no user ID is present in the token, it's an invalid token
    if (!tokenUserId) {
      return res
        .status(401)
        .json({ message: "Invalid token: No user ID present in token." });
    }

    // Attach the user ID to the request object
    req.userId = tokenUserId;

    // Optionally, you can also perform additional checks here
    const requestedUserId = req.params.userId;
    if (requestedUserId && requestedUserId !== tokenUserId) {
      return res.status(403).json({
        message:
          "Access denied. You are not authorized to access this resource.",
      });
    }

    next();
  });
};

export default userAuthorizationMiddleware;
