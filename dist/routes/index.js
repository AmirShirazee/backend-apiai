"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const upload_routes_1 = require("./upload.routes");
const auth_1 = __importDefault(require("../middleware/auth"));
const health_routes_1 = require("./health.routes");
function initRoutes(app) {
    app.use("/backend/api/upload", auth_1.default, upload_routes_1.uploadRouter);
    app.use("/backend/api/health", health_routes_1.healthRouter);
}
exports.initRoutes = initRoutes;
//# sourceMappingURL=index.js.map