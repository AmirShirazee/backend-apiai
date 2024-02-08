"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const upload_routes_1 = require("./upload.routes");
const health_route_1 = require("./health.route");
function initRoutes(app) {
    app.use('/api/upload', upload_routes_1.uploadRouter);
    app.use('/api/health', health_route_1.healthRouter);
}
exports.initRoutes = initRoutes;
//# sourceMappingURL=index.js.map