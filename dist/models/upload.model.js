"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = exports.getFormattedUploadDate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uploadSchema = new mongoose_1.default.Schema({
    _id: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    openApiVersion: {
        type: String,
        required: true,
    },
    uploadDate: {
        type: String,
        required: true,
        default: getFormattedUploadDate(),
    },
    s3Url: {
        type: String,
        required: true,
    },
});
function getFormattedUploadDate() {
    return new Date().toISOString();
}
exports.getFormattedUploadDate = getFormattedUploadDate;
exports.Upload = mongoose_1.default.models.Upload ||
    mongoose_1.default.model('Upload', uploadSchema);
exports.default = exports.Upload;
//# sourceMappingURL=upload.model.js.map