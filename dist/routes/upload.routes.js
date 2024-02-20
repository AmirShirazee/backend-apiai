"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_1 = __importDefault(require("middleware/auth"));
const router = (0, express_1.Router)();
exports.uploadRouter = router;
router
    .post("/:user", upload_controller_1.uploadController)
    .get("/:user", auth_1.default, upload_controller_1.getUploads);
router
    .get("/:user/:id", auth_1.default, upload_controller_1.getUpload)
    .delete("/:user", auth_1.default, upload_controller_1.deleteUpload);
//# sourceMappingURL=upload.routes.js.map