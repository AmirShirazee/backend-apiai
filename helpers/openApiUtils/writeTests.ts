import { uploadToS3 } from '../../utils/s3';
import { bucketNameForTestFiles } from '../../types/s3';

export const writeTest = async (
  user: string,
  importStatement: string,
  formattedTests: string,
): Promise<string> => {
  const fileContent = `import { fail } from 'assert';
import { describe, test, expect } from '@jest/globals';
${importStatement}

${formattedTests}`;

  const timestamp = new Date().toISOString();
  const uniqueKey = `${user}-${timestamp}.spec.ts`;
  await uploadToS3(bucketNameForTestFiles, uniqueKey, fileContent, 'text/plain');

  return uniqueKey;
};
