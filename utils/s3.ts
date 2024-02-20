import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommandOutput,
  S3,
} from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-provider-env';
import { Readable } from 'stream';
import getEnvVar from './getEnvVar';

const s3Client = new S3({
  credentials: fromEnv(),
  region: getEnvVar('AWS_REGION'),
});

const uploadToS3 = async (
  bucketName: string,
  key: string,
  body: Buffer | Uint8Array | Blob | string | ReadableStream,
  contentType: string,
): Promise<PutObjectCommandOutput> => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  };

  return s3Client.putObject(params);
};

// Utility function to convert a stream into a buffer
const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

const getZipFromS3 = async (bucketName: string, key: string): Promise<Buffer> => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const { Body } = await s3Client.send(command);

  if (Body instanceof Readable) {
    return streamToBuffer(Body);
  } else {
    throw new Error('Expected a stream for S3 object body.');
  }
};

const getObjectFromS3 = async (bucketName: string, key: string): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const data = await s3Client.send(command);

  // Assuming the data is in a readable format and not a binary file
  return streamToString(data.Body as Readable);
};

const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
};

const deleteObjectFromS3 = async (bucketName: string, key: string): Promise<void> => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`File deleted successfully: ${bucketName}/${key}`);
  } catch (error) {
    console.error(`Error deleting file: ${bucketName}/${key}`, error);
    throw error; // Rethrowing the error to be handled by the caller
  }
};

const listFilesInFolder = async (bucketName: string, folder: string): Promise<string[]> => {
  const params = {
    Bucket: bucketName,
    Prefix: folder,
  };

  const command = new ListObjectsV2Command(params);
  const data = await s3Client.send(command);

  return (
    data.Contents?.map((file) => file.Key).filter((key): key is string => key !== undefined) || []
  );
};

export { getZipFromS3, uploadToS3, getObjectFromS3, deleteObjectFromS3, listFilesInFolder };
