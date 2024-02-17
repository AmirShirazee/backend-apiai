"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const colors_1 = __importDefault(require("colors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const rate_limit_1 = require("./startup/rate-limit");
const isProd_1 = require("./utils/isProd");
const mongo_1 = __importDefault(require("./db/mongo"));
const port = 3000;
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.get("/backend/api/health", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});
//
// const allowedIPs: string[] = [
//   "217.123.79.176",
//   "172.31.35.192",
//   "13.37.177.41",
// ];
// const ipWhitelistMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const clientIP = req.ip;
//
//   if (allowedIPs.includes(<string>clientIP)) {
//     next();
//   } else {
//     res.status(403).json({ message: "Access denied" });
//   }
// };
const initializeMiddleware = (app) => {
    // app.use(ipWhitelistMiddleware);
    (0, rate_limit_1.initRateLimit)(app);
    app.use((0, cors_1.default)({
        origin: isProd_1.isProduction
            ? "https://testopenapi.com"
            : "http://localhost:8080",
        credentials: true,
    }));
    app.use((0, cookie_parser_1.default)("secret-cookie"));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, morgan_1.default)(isProd_1.isProduction ? "combined" : "dev"));
    (0, routes_1.initRoutes)(app);
};
const startServer = () => {
    app.listen(port, () => {
        console.log(colors_1.default.green.underline(`Server running on port ${port}`));
    });
};
(0, mongo_1.default)()
    .then(() => {
    initializeMiddleware(app);
    startServer();
})
    .catch((err) => {
    console.error(err.message);
});
exports.default = app;
//# sourceMappingURL=index.js.map