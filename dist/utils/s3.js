"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFilesInFolder = exports.deleteObjectFromS3 = exports.getObjectFromS3 = exports.uploadToS3 = exports.getZipFromS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const credential_provider_env_1 = require("@aws-sdk/credential-provider-env");
const stream_1 = require("stream");
const getEnvVar_1 = __importDefault(require("./getEnvVar"));
const s3Client = new client_s3_1.S3({
    credentials: (0, credential_provider_env_1.fromEnv)(),
    region: (0, getEnvVar_1.default)('AWS_REGION'),
});
const uploadToS3 = async (bucketName, key, body, contentType) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
    };
    return s3Client.putObject(params);
};
exports.uploadToS3 = uploadToS3;
// Utility function to convert a stream into a buffer
const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};
const getZipFromS3 = async (bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };
    const command = new client_s3_1.GetObjectCommand(params);
    const { Body } = await s3Client.send(command);
    if (Body instanceof stream_1.Readable) {
        return streamToBuffer(Body);
    }
    else {
        throw new Error('Expected a stream for S3 object body.');
    }
};
exports.getZipFromS3 = getZipFromS3;
const getObjectFromS3 = async (bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };
    const command = new client_s3_1.GetObjectCommand(params);
    const data = await s3Client.send(command);
    // Assuming the data is in a readable format and not a binary file
    return streamToString(data.Body);
};
exports.getObjectFromS3 = getObjectFromS3;
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', reject);
    });
};
const deleteObjectFromS3 = async (bucketName, key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };
    try {
        await s3Client.send(new client_s3_1.DeleteObjectCommand(params));
        console.log(`File deleted successfully: ${bucketName}/${key}`);
    }
    catch (error) {
        console.error(`Error deleting file: ${bucketName}/${key}`, error);
        throw error; // Rethrowing the error to be handled by the caller
    }
};
exports.deleteObjectFromS3 = deleteObjectFromS3;
const listFilesInFolder = async (bucketName, folder) => {
    var _a;
    const params = {
        Bucket: bucketName,
        Prefix: folder,
    };
    const command = new client_s3_1.ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    return (((_a = data.Contents) === null || _a === void 0 ? void 0 : _a.map((file) => file.Key).filter((key) => key !== undefined)) || []);
};
exports.listFilesInFolder = listFilesInFolder;
//# sourceMappingURL=s3.js.map