// import fs from "fs";
// import { pipeline } from "stream/promises";
// import ProjectModel, { IProject } from "../../models/project.model";
// import { uploadToS3 } from "../../utils/s3";
// import { bucketNameForProjects } from "../../types/s3";
//
// const TS_EXTENSION: ".ts" = ".ts";
// const GENERATION_COMMENT = /\/\* tslint:disable \*\/\n\/\* eslint-disable \*\//;
//
// const removeLinesFromFile = async (
//   filePath: string,
//   pattern: RegExp,
// ): Promise<void> => {
//   const readStream: fs.ReadStream = fs.createReadStream(filePath, "utf8");
//   const writeStream: fs.WriteStream = fs.createWriteStream(
//     filePath + ".tmp",
//     "utf8",
//   );
//
//   const transformStream = new Transform({
//     transform(chunk, encoding, callback) {
//       const transformedChunk = chunk.toString().replace(pattern, "");
//       callback(null, transformedChunk);
//     },
//   });
//
//   await pipeline(readStream, transformStream, writeStream);
//   fs.unlinkSync(filePath);
//   fs.renameSync(filePath + ".tmp", filePath);
// };
//
// const generateReadmeContent = (user: string): string => {
//   return `
// # Project for User ${user}
//
// This is a project generated for user ${user}. It focuses on generating automated integration tests based on an OpenAPI specification.
//
// ## Overview
//
// The application includes the following npm packages:
//
// 1. '@jest/globals': A Jest global functions and variables module.
// 2. 'axios': A promise-based HTTP client for the browser and node.js.
// 3. 'typescript': A language for application-scale JavaScript.
// 4. 'dotenv': Zero-dependency module that loads environment variables from a .env file into process.env.
//
// The application uses the OpenAPI specification to generate service files that serve as the basis for the tests.
//
// ## Getting Started
//
// 1. **Install the Packages**: Run the following command to install all the necessary packages:
//
// \`\`\`
// npm install
// \`\`\`
//
// 2. **Setup environment**: Copy the provided .env.example file to a new .env file and fill in your environment variables:
//
// \`\`\`
// cp .env.example .env
// \`\`\`
//
// 3. **Run the Tests**: To run the tests, use the following command:
//
// \`\`\`
// npm test
// \`\`\`
//
// ## Authentication
//
// The application's authentication headers can be set in the .env file.
//
// ## Running locally
//
// Use the following command to run the project locally:
//
// \`\`\`
// npm run start
// \`\`\`
// `;
// };
//
// const generatePackageJsonContent = (user: string) => {
//   return {
//     name: `${user}_project`,
//     version: "1.0.0",
//     description: `Generated project for ${user}`,
//     scripts: {
//       test: "jest",
//       lint: 'eslint "src/**/*.{ts,tsx}"',
//       format: 'prettier --write "src/**/*.{ts,tsx}"',
//     },
//     dependencies: {},
//     devDependencies: {
//       "@jest/globals": "^29.6.1",
//       axios: "^1.4.1",
//       typescript: "^4.9.3",
//       dotenv: "^16.3.1",
//       "ts-node": "^10.4.0",
//       eslint: "^8.4.1",
//       "@typescript-eslint/parser": "^5.59.5",
//       "@typescript-eslint/eslint-plugin": "^5.59.5",
//       prettier: "^2.7.1",
//     },
//   };
// };
//
// const generateTsconfigJsonContent = () => {
//   return {
//     compilerOptions: {
//       target: "es5",
//       module: "commonjs",
//       strict: true,
//       esModuleInterop: true,
//       skipLibCheck: true,
//       forceConsistentCasingInFileNames: true,
//     },
//   };
// };
//
// const generatePrettierRcContent = (): string => {
//   return `
// module.exports = {
//   semi: true,
//   trailingComma: 'all',
//   singleQuote: true,
//   printWidth: 80,
//   tabWidth: 2,
// };
// `;
// };
//
// const generateEslintRcContent = (): string => {
//   return `
// module.exports = {
//   root: true,
//   parser: '@typescript-eslint/parser',
//   plugins: ['@typescript-eslint'],
//   extends: [
//     'eslint:recommended',
//     'plugin:@typescript-eslint/recommended',
//   ],
// };
// `;
// };
//
// const generateEnvExampleContent = (): string => {
//   return `
// BASE_URL=
// API_VERSION=
// WITH_CREDENTIALS=
// CREDENTIALS=
// TOKEN=
// USERNAME=
// PASSWORD=
// CONTENT_TYPE=
// `;
// };
//
// const generateJestConfigContent = (): string => {
//   return `
// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
// };
// `;
// };
//
// export const packageProject = async (user: string) => {
//   try {
//     // Generate content
//     const filesToGenerate = {
//       "tsconfig.json": generateTsconfigJsonContent(),
//       "package.json": generatePackageJsonContent(user),
//       "README.md": generateReadmeContent(user),
//       ".env.example": generateEnvExampleContent(),
//       "jest.config.js": generateJestConfigContent(),
//       ".prettierrc": generatePrettierRcContent(),
//       ".eslintrc": generateEslintRcContent(),
//     };
//
//     const s3Urls: Record<string, string> = {};
//
//     // Upload generated files to S3
//     for (const [filename, content] of Object.entries(filesToGenerate)) {
//       const fileContent =
//         typeof content === "string"
//           ? content
//           : JSON.stringify(content, null, 2);
//       const s3Key = `projects/${user}/${filename}`;
//       await uploadToS3(bucketNameForProjects, s3Key, fileContent, "text/plain");
//       s3Urls[
//         filename
//       ] = `https://${bucketNameForProjects}.s3.amazonaws.com/${s3Key}`;
//     }
//
//     // Create and save a new project model with S3 URLs
//     const userDocument: IProject = new ProjectModel({
//       user: user,
//       projectFiles: s3Urls,
//     });
//
//     await userDocument.save();
//
//     return s3Urls;
//   } catch (error: any) {
//     console.error("Error packaging project:", error);
//     throw error;
//   }
// };
