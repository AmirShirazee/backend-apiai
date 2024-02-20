"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const router = (0, express_1.Router)();
exports.uploadRouter = router;
router.post("/:user", upload_controller_1.uploadController).get("/:user", upload_controller_1.getUploads);
router.get("/:user/:id", upload_controller_1.getUpload).delete("/:user", upload_controller_1.deleteUpload);
//# sourceMappingURL=upload.routes.js.map