"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndUploadService = exports.generateRandomString = exports.formatDate = exports.postTests = exports.postOpenApi = exports.handleFileProcessing = void 0;
const archiver_1 = __importDefault(require("archiver"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = require("path");
const validateUploadFile_1 = require("./validateUploadFile");
const saveGeneratedTests_1 = require("./saveGeneratedTests");
const generateAllTestsFromSpec_1 = require("./generateAllTestsFromSpec");
const node_os_1 = require("node:os");
const node_fs_1 = require("node:fs");
const unzipper_1 = __importDefault(require("unzipper"));
const user_model_1 = __importDefault(require("../models/user.model"));
const s3_1 = require("../utils/s3");
const s3_2 = require("../types/s3");
const upload_model_1 = __importDefault(require("../models/upload.model"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const OpenAPI_ = require('openapi-typescript-codegen');
const handleFileProcessing = async (userId, postOpenApiFn = exports.postOpenApi, postTestsFn = exports.postTests) => {
    try {
        const { spec, s3Url } = await postOpenApiFn(userId);
        await postTestsFn({ userId: userId, spec, s3Url });
    }
    catch (error) {
        throw error;
    }
};
exports.handleFileProcessing = handleFileProcessing;
const postOpenApi = async (userId, processUploadsFn = processUploads) => {
    const openApiSpecs = await processUploadsFn(userId);
    if (openApiSpecs.length === 0) {
        throw new Error('No OpenAPI specifications found for this user.');
    }
    const spec = openApiSpecs[0];
    (0, validateUploadFile_1.validateUploadFile)(spec);
    // Generate and upload OpenAPI client and service
    const result = await (0, exports.generateAndUploadService)(spec, userId);
    await user_model_1.default.updateOne({ _id: userId }, { didUpload: true });
    return {
        userId,
        spec: result.spec,
        s3Url: result.s3Url,
        status: 'success',
        message: 'OpenAPI specification uploaded successfully.',
    };
};
exports.postOpenApi = postOpenApi;
const postTests = async (data, generateAllTestsFromSpecFn = generateAllTestsFromSpec_1.generateAllTestsFromSpec, saveGeneratedTestsFn = saveGeneratedTests_1.saveGeneratedTests) => {
    const { userId, spec, s3Url } = data;
    const tempDir = (0, path_1.join)((0, node_os_1.tmpdir)(), 'openapi-test-gen', userId, (0, exports.generateRandomString)(10));
    await promises_1.default.mkdir(tempDir, { recursive: true });
    let tests;
    try {
        // Extract the key from the S3 URL
        const url = new URL(s3Url);
        const key = url.pathname.substring(1);
        const zipFile = await (0, s3_1.getZipFromS3)(s3_2.bucketNameForServices, key);
        const zipFilePath = (0, path_1.join)(tempDir, 'downloaded.zip');
        await promises_1.default.writeFile(zipFilePath, zipFile);
        // Unzip the file
        const outputDir = (0, path_1.join)(tempDir, 'unzipped');
        await promises_1.default.mkdir(outputDir, { recursive: true });
        // In postTests function, after unzipping:
        await unzipFile(zipFilePath, outputDir);
        try {
            const files = await promises_1.default.readdir(outputDir);
            if (!files.includes('services')) {
                throw new Error('Services directory missing after unzipping');
            }
        }
        catch (error) {
            throw error;
        }
        // Directly generate tests from spec
        tests = await generateAllTestsFromSpecFn(spec, outputDir);
    }
    catch (error) {
        console.error('Error generating tests:', error);
        throw new Error(`Test generation failed: ${error.message}`);
    }
    try {
        await saveGeneratedTestsFn(userId, tests);
    }
    catch (error) {
        console.error('Error saving generated tests:', error);
        // @ts-ignore
        throw new Error(`Saving generated tests failed: ${error.message}`);
    }
    return {
        userId,
        status: 'success',
        message: 'Tests generated and saved successfully.',
    };
};
exports.postTests = postTests;
const processUploads = async (userId) => {
    const uploads = await upload_model_1.default.find({ user: userId });
    if (uploads.length === 0) {
        throw new Error('No OpenAPI specifications found for this user.');
    }
    return await Promise.all(uploads.map(async (upload) => {
        // Assuming upload.s3Url is stored in your Upload model
        const urlParts = new URL(upload.s3Url);
        const key = urlParts.pathname.substring(1);
        const bucketName = urlParts.host.split('.')[0];
        const fileContent = await (0, s3_1.getObjectFromS3)(bucketName, key);
        return JSON.parse(fileContent);
    }));
};
const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year}:${hours}:${minutes}:${seconds}`;
};
exports.formatDate = formatDate;
const generateRandomString = (length) => {
    return [...Array(length)].map(() => Math.random().toString(36).charAt(2)).join('');
};
exports.generateRandomString = generateRandomString;
const generateUniqueIdentifier = () => {
    const now = new Date();
    const formattedDate = (0, exports.formatDate)(now);
    const randomString = (0, exports.generateRandomString)(16);
    return `${formattedDate}${randomString}`;
};
// Function to compile TypeScript files to JavaScript
async function compileTypeScript(srcDirectory, outDirectory) {
    // Ensure the output directory exists
    await promises_1.default.mkdir(outDirectory, { recursive: true });
    // Command to compile TypeScript files
    const tscCommand = `npx tsc --outDir ${outDirectory} --module CommonJS --target ESNext ${srcDirectory}/*.ts`;
    try {
        const { stdout, stderr } = await execAsync(tscCommand);
        console.log('TypeScript Compilation Output:', stdout);
        if (stderr) {
            console.error('TypeScript Compilation Errors:', stderr);
        }
    }
    catch (error) {
        console.error('Failed to compile TypeScript files:', error);
        throw new Error(`TypeScript compilation failed: ${error.message}`);
    }
}
const generateAndUploadService = async (spec, userId) => {
    const tempDir = (0, path_1.join)((0, node_os_1.tmpdir)(), 'openapi-gen', (0, exports.generateRandomString)(10));
    await promises_1.default.mkdir(tempDir, { recursive: true });
    // Generate the OpenAPI service in the temporary directory
    await OpenAPI_.generate({
        input: spec,
        output: tempDir,
    });
    console.log(`Generated API service in directory: ${tempDir}`);
    const servicesDir = (0, path_1.join)(tempDir, 'services');
    // Compile TypeScript files to JavaScript
    try {
        const jsServicesDir = (0, path_1.join)(tempDir, 'js-services');
        await compileTypeScript(servicesDir, jsServicesDir);
        console.log('TypeScript files compiled to JavaScript successfully.');
        // Proceed with zipping the compiled JavaScript directory
        const zipFilePath = (0, path_1.join)((0, node_os_1.tmpdir)(), `${(0, exports.generateRandomString)(10)}.zip`);
        // Note: Ensure `zipDirectory` is adjusted to zip `jsServicesDir` instead of `tempDir`
        const zipBuffer = await zipDirectory(jsServicesDir, zipFilePath);
        const s3Key = `users/${userId}/${generateUniqueIdentifier()}.zip`;
        await (0, s3_1.uploadToS3)(s3_2.bucketNameForServices, s3Key, zipBuffer, 'application/zip');
        const s3Url = `https://${s3_2.bucketNameForServices}.s3.amazonaws.com/${s3Key}`;
        return {
            s3Url,
            spec,
        };
    }
    catch (error) {
        console.error(`Error in processing: ${error.message}`);
        throw error;
    }
};
exports.generateAndUploadService = generateAndUploadService;
const zipDirectory = async (sourceDir, outPath) => {
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    const output = (0, node_fs_1.createWriteStream)(outPath);
    archive.pipe(output);
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.warn(`Warning during archiving: ${err.message}`);
        }
        else {
            throw err;
        }
    });
    archive.on('error', function (err) {
        throw err;
    });
    archive.directory(sourceDir, false);
    await archive.finalize();
    return new Promise((resolve, reject) => {
        output.on('close', async () => {
            try {
                const zipBuffer = await promises_1.default.readFile(outPath);
                resolve(zipBuffer);
            }
            catch (err) {
                reject(err);
            }
        });
    });
};
const unzipFile = async (zipFilePath, outputPath) => {
    return new Promise((resolve, reject) => {
        (0, node_fs_1.createReadStream)(zipFilePath)
            .pipe(unzipper_1.default.Parse())
            .on('entry', function (entry) {
            const fileName = entry.path;
            const type = entry.type; // 'Directory' or 'File'
            if (type === 'File') {
                entry.pipe((0, node_fs_1.createWriteStream)((0, path_1.join)(outputPath, fileName)));
            }
            else {
                // Ensure directory is created
                (0, node_fs_1.mkdirSync)((0, path_1.join)(outputPath, fileName), { recursive: true });
                entry.autodrain();
            }
        })
            .on('close', () => {
            resolve();
        })
            .on('error', (error) => {
            console.error(`Error during unzipping: ${error.message}`);
            reject(error);
        });
    });
};
//# sourceMappingURL=handleFileProcessing.js.map