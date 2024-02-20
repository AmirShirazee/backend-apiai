"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const testMetadataSchema = new mongoose_1.default.Schema({
    operationId: { type: String, default: null },
    method: { type: String, required: true },
    statusCode: { type: String, required: true },
    testType: { type: String, required: true },
});
exports.TestData = mongoose_1.default.models.TestMetadata ||
    mongoose_1.default.model("TestData", testMetadataSchema);
//# sourceMappingURL=testDataMeta.model.js.map