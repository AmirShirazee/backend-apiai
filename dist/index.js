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
const allowedOrigins = ["http://localhost:8080", "https://testopenapi.com"];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
const initializeMiddleware = (app) => {
    // Initialize rate limiting
    (0, rate_limit_1.initRateLimit)(app);
    // Initialize CORS
    app.use((0, cors_1.default)(corsOptions));
    // Handle preflight requests
    app.options("*", (0, cors_1.default)(corsOptions));
    // Other middleware
    app.use((0, cookie_parser_1.default)("secret-cookie"));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, morgan_1.default)(isProd_1.isProduction ? "combined" : "dev"));
    // Initialize routes
    (0, routes_1.initRoutes)(app);
};
// Health check route outside of initRoutes to ensure it's available
app.get("/backend/api/health", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});
const startServer = () => {
    app.listen(port, () => {
        console.log(colors_1.default.green.underline(`Server running on port ${port}`));
    });
};
(0, mongo_1.default)()
    .then(() => {
    initializeMiddleware(app);
    startServer();
    console.log(colors_1.default.green.underline("Alive and kicking!"));
})
    .catch((err) => {
    console.error(err.message);
});
exports.default = app;
//# sourceMappingURL=index.js.map