"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("express-jwt");
const jwtMiddleware = jwt({
    secret: process.env.NEXTAUTH_SECRET,
    algorithms: ["HS256"],
    getToken: (req) => {
        const authHeader = req.headers.authorization;
        return authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    },
});
exports.default = jwtMiddleware;
//# sourceMappingURL=jwt.js.map