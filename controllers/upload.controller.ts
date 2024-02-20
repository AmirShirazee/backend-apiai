import path from "path";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { handleFileProcessing } from "../helpers/handleFileProcessing";
import Upload, { getFormattedUploadDate } from "../models/upload.model";
import User from "../models/user.model";
import TestFile from "../models/testfile.model";
import ProjectModel from "../models/project.model";
import {
  deleteObjectFromS3,
  getObjectFromS3,
  listFilesInFolder,
  uploadToS3,
} from "../utils/s3";
import { bucketNameForUploads } from "../types/s3";
import { isValidOpenApiV3 } from "../openApi/utils/validators";
const storage: multer.StorageEngine = multer.memoryStorage();

function checkFileType(file: any, cb: any) {
  const filetypes: RegExp = /json/;
  const extname: boolean = filetypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype: boolean = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("sorry, currently only json files are supported!", false);
  }
}

const upload: multer.Multer = multer({
  storage,
  fileFilter: function (req: Request, file, cb) {
    checkFileType(file, cb);
  },
});

export const uploadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // @ts-ignore
  upload.single("file")(req, res, async (err: any) => {
    if (err) {
      return next(err);
    }

    const { file: uploadedFile } = req;
    if (!uploadedFile || !uploadedFile.buffer) {
      return res.status(400).json({ message: "Invalid or missing file." });
    }

    const { user } = req.params;
    const file = JSON.parse(uploadedFile.buffer.toString());
    if (!isValidOpenApiV3(file)) {
      return res.status(400).json({
        message:
          "The file does not adhere to the  OpenAPI v3 specification. Please upload a valid OpenAPI v3 specification",
      });
    }

    const doc = await Upload.find({ user: user });
    if (doc) {
      await Upload.deleteMany({ user: user });
    }

    // Define the S3 bucket name and the file key
    const folderName = "uploads/" + user;
    const s3FileKey = `${folderName}/${Date.now()}.json`;

    try {
      // Delete previous files from S3
      const files: string[] = await listFilesInFolder(
        bucketNameForUploads,
        folderName,
      );
      await Promise.all(
        files.map((fileKey) =>
          deleteObjectFromS3(bucketNameForUploads, fileKey),
        ),
      );

      // Upload new file to S3
      await uploadToS3(
        bucketNameForUploads,
        s3FileKey,
        uploadedFile.buffer,
        "application/json",
      );

      // Update MongoDB with the reference to the S3 file
      await Upload.updateOne(
        { user: user },
        {
          user: user,
          s3Url: `https://${bucketNameForUploads}.s3.amazonaws.com/${s3FileKey}`,
          openApiVersion: file.openapi,
          title: file.info.title,
          uploadDate: getFormattedUploadDate(),
        },
        { upsert: true },
      );
      await User.updateOne(
        { _id: user },
        {
          didUpload: true,
          project: true,
          uploadedAtDate: getFormattedUploadDate(),
        },
      );

      await TestFile.deleteMany({ user: user });
      await ProjectModel.deleteMany({ user: user });
      await handleFileProcessing(user);

      return res.status(201).json({ message: "File uploaded successfully" });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        message: "Error during file upload!",
        error: error.message,
      });
    }
  });
};

export const getUploads = async (req: Request, res: Response) => {
  const uploads = await Upload.find({ user: req.params.user });

  if (!uploads || uploads.length === 0) {
    return res.status(404).json({ message: "No uploads found for this user." });
  }

  // Fetching file content from S3
  const uploadData = await Promise.all(
    uploads.map(async (upload) => {
      // Extract the key from the s3Url
      const urlParts = new URL(upload.s3Url);
      const key = urlParts.pathname.substring(1);
      const bucketName = urlParts.host.split(".")[0];

      const content = await getObjectFromS3(bucketName, key);
      return { ...upload.toObject(), fileContent: content };
    }),
  );

  res.status(200).json({
    isUploaded: true,
    uploads: uploadData,
  });
};

export const getUpload = async (req: Request, res: Response) => {
  const upload = await Upload.findById(req.params.id);

  if (!upload) {
    return res.status(404).json({ message: "Upload not found." });
  }

  const urlParts = new URL(upload.s3Url);
  const key = urlParts.pathname.substring(1);
  const bucketName = urlParts.host.split(".")[0];

  const fileContent = await getObjectFromS3(bucketName, key);

  res.status(200).json({
    upload,
    fileContent,
  });
};

export const deleteUpload = async (req: Request, res: Response) => {
  const { user } = req.params;

  try {
    const uploads = await Upload.find({ user: user });
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
      await deleteObjectFromS3(bucketName, key);
    }

    await deleteUserRelatedData(user);

    return res.json({
      status: "success",
      message: "Upload deleted",
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the upload",
    });
  }
};

export const deleteUserRelatedData = async (userId: string) => {
  try {
    await Upload.find({ user: userId }).deleteMany();
    await ProjectModel.find({ user: userId }).deleteMany();
    await TestFile.find({ user: userId }).deleteMany();
    await User.updateOne({ _id: userId }, { didUpload: false, project: false });
  } catch (error: any) {
    console.error("Error deleting user-related data:", error.message);
    throw error;
  }
};
