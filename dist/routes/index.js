"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const upload_routes_1 = require("./upload.routes");
function initRoutes(app) {
    app.use('/api/upload', upload_routes_1.uploadRouter);
}
exports.initRoutes = initRoutes;
//# sourceMappingURL=index.js.map