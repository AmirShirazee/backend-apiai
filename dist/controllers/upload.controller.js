"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserRelatedData = exports.deleteUpload = exports.getUpload = exports.getUploads = exports.uploadController = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const handleFileProcessing_1 = require("../helpers/handleFileProcessing");
const upload_model_1 = __importStar(require("../models/upload.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const testfile_model_1 = __importDefault(require("../models/testfile.model"));
const project_model_1 = __importDefault(require("../models/project.model"));
const s3_1 = require("../utils/s3");
const s3_2 = require("../types/s3");
const validators_1 = require("../openApi/utils/validators");
const storage = multer_1.default.memoryStorage();
function checkFileType(file, cb) {
    const filetypes = /json/;
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    else {
        cb("sorry, currently only json files are supported!", false);
    }
}
const upload = (0, multer_1.default)({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});
const uploadController = async (req, res, next) => {
    // @ts-ignore
    upload.single("file")(req, res, async (err) => {
        if (err) {
            return next(err);
        }
        const { file: uploadedFile } = req;
        if (!uploadedFile || !uploadedFile.buffer) {
            return res.status(400).json({ message: "Invalid or missing file." });
        }
        const { user } = req.params;
        const file = JSON.parse(uploadedFile.buffer.toString());
        if (!(0, validators_1.isValidOpenApiV3)(file)) {
            return res.status(400).json({
                message: "The file does not adhere to the  OpenAPI v3 specification. Please upload a valid OpenAPI v3 specification",
            });
        }
        const doc = await upload_model_1.default.find({ user: user });
        if (doc) {
            await upload_model_1.default.deleteMany({ user: user });
        }
        // Define the S3 bucket name and the file key
        const folderName = "uploads/" + user;
        const s3FileKey = `${folderName}/${Date.now()}.json`;
        try {
            // Delete previous files from S3
            const files = await (0, s3_1.listFilesInFolder)(s3_2.bucketNameForUploads, folderName);
            await Promise.all(files.map((fileKey) => (0, s3_1.deleteObjectFromS3)(s3_2.bucketNameForUploads, fileKey)));
            // Upload new file to S3
            await (0, s3_1.uploadToS3)(s3_2.bucketNameForUploads, s3FileKey, uploadedFile.buffer, "application/json");
            // Update MongoDB with the reference to the S3 file
            await upload_model_1.default.updateOne({ user: user }, {
                user: user,
                s3Url: `https://${s3_2.bucketNameForUploads}.s3.amazonaws.com/${s3FileKey}`,
                openApiVersion: file.openapi,
                title: file.info.title,
                uploadDate: (0, upload_model_1.getFormattedUploadDate)(),
            }, { upsert: true });
            await user_model_1.default.updateOne({ _id: user }, {
                didUpload: true,
                project: true,
                uploadedAtDate: (0, upload_model_1.getFormattedUploadDate)(),
            });
            await testfile_model_1.default.deleteMany({ user: user });
            await project_model_1.default.deleteMany({ user: user });
            await (0, handleFileProcessing_1.handleFileProcessing)(user);
            return res.status(201).json({ message: "File uploaded successfully" });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Error during file upload!",
                error: error.message,
            });
        }
    });
};
exports.uploadController = uploadController;
const getUploads = async (req, res) => {
    const uploads = await upload_model_1.default.find({ user: req.params.user });
    if (!uploads || uploads.length === 0) {
        return res.status(404).json({ message: "No uploads found for this user." });
    }
    // Fetching file content from S3
    const uploadData = await Promise.all(uploads.map(async (upload) => {
        // Extract the key from the s3Url
        const urlParts = new URL(upload.s3Url);
        const key = urlParts.pathname.substring(1);
        const bucketName = urlParts.host.split(".")[0];
        const content = await (0, s3_1.getObjectFromS3)(bucketName, key);
        return { ...upload.toObject(), fileContent: content };
    }));
    res.status(200).json({
        isUploaded: true,
        uploads: uploadData,
    });
};
exports.getUploads = getUploads;
const getUpload = async (req, res) => {
    const upload = await upload_model_1.default.findById(req.params.id);
    if (!upload) {
        return res.status(404).json({ message: "Upload not found." });
    }
    const urlParts = new URL(upload.s3Url);
    const key = urlParts.pathname.substring(1);
    const bucketName = urlParts.host.split(".")[0];
    const fileContent = await (0, s3_1.getObjectFromS3)(bucketName, key);
    res.status(200).json({
        upload,
        fileContent,
    });
};
exports.getUpload = getUpload;
const deleteUpload = async (req, res) => {
    const { user } = req.params;
    try {
        const uploads = await upload_model_1.default.find({ user: user });
        if (!uploads || uploads.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "No document found with that ID",
            });
        }
        for (const upload of uploads) {
            const urlParts = new URL(upload.s3Url);
            const key = urlParts.pathname.substring(1);
            const bucketName = urlParts.host.split(".")[0];
            await (0, s3_1.deleteObjectFromS3)(bucketName, key);
        }
        await (0, exports.deleteUserRelatedData)(user);
        return res.json({
            status: "success",
            message: "Upload deleted",
        });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while deleting the upload",
        });
    }
};
exports.deleteUpload = deleteUpload;
const deleteUserRelatedData = async (userId) => {
    try {
        await upload_model_1.default.find({ user: userId }).deleteMany();
        await project_model_1.default.find({ user: userId }).deleteMany();
        await testfile_model_1.default.find({ user: userId }).deleteMany();
        await user_model_1.default.updateOne({ _id: userId }, { didUpload: false, project: false });
    }
    catch (error) {
        console.error("Error deleting user-related data:", error.message);
        throw error;
    }
};
exports.deleteUserRelatedData = deleteUserRelatedData;
//# sourceMappingURL=upload.controller.js.map