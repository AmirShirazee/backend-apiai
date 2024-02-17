import archiver from "archiver";
import fs from "fs/promises";
import { join } from "path";
import { validateUploadFile } from "./validateUploadFile";
import { saveGeneratedTests } from "./saveGeneratedTests";
import { generateAllTestsFromSpec } from "./generateAllTestsFromSpec";
import { tmpdir } from "node:os";
import { createReadStream, createWriteStream, mkdirSync } from "node:fs";
import unzipper from "unzipper";
import { OpenApi } from "../openApi/src/openApi/v3/interfaces/OpenApi";
import {
  OpenApiUploadResult,
  ServiceUploadResult,
} from "../types/handleFileProcessing-types";
import User from "../models/user.model";
import { getObjectFromS3, getZipFromS3, uploadToS3 } from "../utils/s3";
import { bucketNameForServices } from "../types/s3";
import Upload from "../models/upload.model";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

const OpenAPI_ = require("openapi-typescript-codegen");

export const handleFileProcessing = async (
  userId: string,
  postOpenApiFn = postOpenApi,
  postTestsFn = postTests,
) => {
  try {
    const { spec, s3Url } = await postOpenApiFn(userId);

    await postTestsFn({ userId: userId, spec, s3Url });
  } catch (error: any) {
    throw error;
  }
};

export const postOpenApi = async (
  userId: string,
  processUploadsFn = processUploads,
): Promise<OpenApiUploadResult> => {
  const openApiSpecs = await processUploadsFn(userId);

  if (openApiSpecs.length === 0) {
    throw new Error("No OpenAPI specifications found for this user.");
  }

  const spec = openApiSpecs[0];
  validateUploadFile(spec);

  const result: ServiceUploadResult = await generateAndUploadService(
    spec,
    userId,
  );

  await User.updateOne({ _id: userId }, { didUpload: true });

  return {
    userId,
    spec: result.spec,
    s3Url: result.s3Url,
    status: "success",
    message: "OpenAPI specification uploaded successfully.",
  };
};

export const postTests = async (
  data: {
    userId: string;
    spec: OpenApi;
    s3Url: string;
  },
  generateAllTestsFromSpecFn = generateAllTestsFromSpec,
  saveGeneratedTestsFn = saveGeneratedTests,
) => {
  const { userId, spec, s3Url } = data;

  const tempDir = join(
    tmpdir(),
    "openapi-test-gen",
    userId,
    generateRandomString(10),
  );
  await fs.mkdir(tempDir, { recursive: true });

  let tests;
  try {
    const url = new URL(s3Url);
    const key = url.pathname.substring(1);

    const zipFile = await getZipFromS3(bucketNameForServices, key);
    const zipFilePath = join(tempDir, "downloaded.zip");
    await fs.writeFile(zipFilePath, zipFile);

    const outputDir = join(tempDir, "unzipped");
    await fs.mkdir(outputDir, { recursive: true });
    // In postTests function, after unzipping:
    await unzipFile(zipFilePath, outputDir);

    try {
      const files = await fs.readdir(outputDir);
      if (!files.includes("services")) {
        throw new Error("Services directory missing after unzipping");
      }
    } catch (error: any) {
      throw error;
    }

    // Directly generate tests from spec
    tests = await generateAllTestsFromSpecFn(spec, outputDir);
  } catch (error: any) {
    console.error("Error generating tests:", error);
    throw new Error(`Test generation failed: ${error.message}`);
  }

  try {
    await saveGeneratedTestsFn(userId, tests);
  } catch (error) {
    console.error("Error saving generated tests:", error);
    // @ts-ignore
    throw new Error(`Saving generated tests failed: ${error.message}`);
  }

  return {
    userId,
    status: "success",
    message: "Tests generated and saved successfully.",
  };
};

const processUploads = async (userId: string) => {
  const uploads = await Upload.find({ user: userId });
  if (uploads.length === 0) {
    throw new Error("No OpenAPI specifications found for this user.");
  }

  return await Promise.all(
    uploads.map(async (upload) => {
      // Assuming upload.s3Url is stored in your Upload model
      const urlParts = new URL(upload.s3Url);
      const key = urlParts.pathname.substring(1);
      const bucketName = urlParts.host.split(".")[0];

      const fileContent = await getObjectFromS3(bucketName, key);
      return JSON.parse(fileContent);
    }),
  );
};

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year}:${hours}:${minutes}:${seconds}`;
};

export const generateRandomString = (length: number): string => {
  return [...Array(length)]
    .map(() => Math.random().toString(36).charAt(2))
    .join("");
};

const generateUniqueIdentifier = () => {
  const now = new Date();
  const formattedDate = formatDate(now);
  const randomString = generateRandomString(16);
  return `${formattedDate}${randomString}`;
};

// Function to compile TypeScript files to JavaScript
async function compileTypeScript(
  srcDirectory: string,
  outDirectory: string,
): Promise<void> {
  // Ensure the output directory exists
  await fs.mkdir(outDirectory, { recursive: true });

  // Command to compile TypeScript files
  const tscCommand = `npx tsc --outDir ${outDirectory} --module CommonJS --target ESNext ${srcDirectory}/*.ts`;
  try {
    const { stdout, stderr } = await execAsync(tscCommand);
    console.log("TypeScript Compilation Output:", stdout);
    if (stderr) {
      console.error("TypeScript Compilation Errors:", stderr);
    }
  } catch (error: any) {
    console.error("Failed to compile TypeScript files:", error);
    throw new Error(`TypeScript compilation failed: ${error.message}`);
  }
}

export const generateAndUploadService = async (
  spec: OpenApi,
  userId: string,
) => {
  const tempDir = join(tmpdir(), "openapi-gen", generateRandomString(10));
  await fs.mkdir(tempDir, { recursive: true });

  // Generate the OpenAPI service in the temporary directory
  await OpenAPI_.generate({
    input: spec,
    output: tempDir,
  });

  console.log(`Generated API service in directory: ${tempDir}`);
  const servicesDir = join(tempDir, "services");

  // Compile TypeScript files to JavaScript
  try {
    const jsServicesDir = join(tempDir, "js-services");
    await compileTypeScript(servicesDir, jsServicesDir);

    console.log("TypeScript files compiled to JavaScript successfully.");

    // Proceed with zipping the compiled JavaScript directory
    const zipFilePath = join(tmpdir(), `${generateRandomString(10)}.zip`);
    // Note: Ensure `zipDirectory` is adjusted to zip `jsServicesDir` instead of `tempDir`
    const zipBuffer = await zipDirectory(jsServicesDir, zipFilePath);

    const s3Key = `users/${userId}/${generateUniqueIdentifier()}.zip`;
    await uploadToS3(
      bucketNameForServices,
      s3Key,
      zipBuffer,
      "application/zip",
    );

    const s3Url = `https://${bucketNameForServices}.s3.amazonaws.com/${s3Key}`;

    return {
      s3Url,
      spec,
    };
  } catch (error: any) {
    console.error(`Error in processing: ${error.message}`);
    throw error;
  }
};

const zipDirectory = async (
  sourceDir: string,
  outPath: string,
): Promise<Buffer> => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const output = createWriteStream(outPath);
  archive.pipe(output);

  archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
      console.warn(`Warning during archiving: ${err.message}`);
    } else {
      throw err;
    }
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.directory(sourceDir, false);
  await archive.finalize();

  return new Promise<Buffer>((resolve, reject) => {
    output.on("close", async () => {
      try {
        const zipBuffer = await fs.readFile(outPath);
        resolve(zipBuffer);
      } catch (err) {
        reject(err);
      }
    });
  });
};
const unzipFile = async (zipFilePath: string, outputPath: string) => {
  return new Promise<void>((resolve, reject) => {
    createReadStream(zipFilePath)
      .pipe(unzipper.Parse())
      .on("entry", function (entry) {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'

        if (type === "File") {
          entry.pipe(createWriteStream(join(outputPath, fileName)));
        } else {
          // Ensure directory is created
          mkdirSync(join(outputPath, fileName), { recursive: true });
          entry.autodrain();
        }
      })
      .on("close", () => {
        resolve();
      })
      .on("error", (error) => {
        console.error(`Error during unzipping: ${error.message}`);
        reject(error);
      });
  });
};
