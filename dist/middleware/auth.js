"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = __importDefault(require("../utils/jwt"));
const userAuthorizationMiddleware = (req, res, next) => {
    // Validate the token first
    (0, jwt_1.default)(req, res, () => {
        var _a;
        // After jwtMiddleware, the token's payload should be available in req.auth
        const tokenUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.id;
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
                message: "Access denied. You are not authorized to access this resource.",
            });
        }
        next();
    });
};
exports.default = userAuthorizationMiddleware;
//# sourceMappingURL=auth.js.map