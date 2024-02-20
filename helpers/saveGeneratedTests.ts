import { writeTest } from './openApiUtils/writeTests';
import TestFile from '../models/testfile.model';

export const createAndSaveTestFileModel = async (s3Key: string, userId: string): Promise<void> => {
  const testFile = new TestFile({
    s3Key: s3Key,
    user: userId,
  });

  await TestFile.deleteMany({ user: userId });

  await testFile.save();
};

export const saveGeneratedTests = async (
  userId: string,
  tests: { importStatement: string; formattedTests: string },
  writeTestFn = writeTest,
  createAndSaveTestFileModelFn = createAndSaveTestFileModel,
): Promise<void> => {
  const { importStatement, formattedTests } = tests;

  const s3Key = await writeTestFn(userId, importStatement, formattedTests);

  // Save the s3Key instead of s3Url
  await createAndSaveTestFileModelFn(s3Key, userId);
};
