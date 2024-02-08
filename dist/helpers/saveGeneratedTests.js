"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGeneratedTests = exports.createAndSaveTestFileModel = void 0;
const writeTests_1 = require("./openApiUtils/writeTests");
const testfile_model_1 = __importDefault(require("../models/testfile.model"));
const createAndSaveTestFileModel = async (s3Key, userId) => {
    const testFile = new testfile_model_1.default({
        s3Key: s3Key,
        user: userId,
    });
    await testfile_model_1.default.deleteMany({ user: userId });
    await testFile.save();
};
exports.createAndSaveTestFileModel = createAndSaveTestFileModel;
const saveGeneratedTests = async (userId, tests, writeTestFn = writeTests_1.writeTest, createAndSaveTestFileModelFn = exports.createAndSaveTestFileModel) => {
    const { importStatement, formattedTests } = tests;
    const s3Key = await writeTestFn(userId, importStatement, formattedTests);
    // Save the s3Key instead of s3Url
    await createAndSaveTestFileModelFn(s3Key, userId);
};
exports.saveGeneratedTests = saveGeneratedTests;
//# sourceMappingURL=saveGeneratedTests.js.map