"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const upload_routes_1 = require("./upload.routes");
const auth_1 = __importDefault(require("../middleware/auth"));
function initRoutes(app) {
    app.use("/backend/api/upload", auth_1.default, upload_routes_1.uploadRouter);
}
exports.initRoutes = initRoutes;
//# sourceMappingURL=index.js.map