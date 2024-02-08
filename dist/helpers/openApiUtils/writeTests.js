"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeTest = void 0;
const s3_1 = require("../../utils/s3");
const s3_2 = require("../../types/s3");
const writeTest = async (user, importStatement, formattedTests) => {
    const fileContent = `import { fail } from 'assert';
import { describe, test, expect } from '@jest/globals';
${importStatement}

${formattedTests}`;
    const timestamp = new Date().toISOString();
    const uniqueKey = `${user}-${timestamp}.spec.ts`;
    await (0, s3_1.uploadToS3)(s3_2.bucketNameForTestFiles, uniqueKey, fileContent, 'text/plain');
    return uniqueKey;
};
exports.writeTest = writeTest;
//# sourceMappingURL=writeTests.js.map