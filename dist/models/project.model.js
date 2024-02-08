"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProjectSchema = new mongoose_1.default.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
    },
    project: {
        type: Buffer,
        required: true,
    },
});
exports.ProjectModel = mongoose_1.default.models.Project ||
    mongoose_1.default.model("Project", ProjectSchema);
exports.default = exports.ProjectModel;
//# sourceMappingURL=project.model.js.map