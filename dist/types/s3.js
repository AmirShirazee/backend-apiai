"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Buckets = exports.bucketNameForServices = exports.bucketNameForUploads = exports.bucketNameForProjects = exports.bucketNameForTestFiles = void 0;
var S3Buckets;
(function (S3Buckets) {
    S3Buckets["TestFiles"] = "apiai-testfiles";
    S3Buckets["Projects"] = "apiai-projects";
    S3Buckets["Uploads"] = "apiai-uploads";
    S3Buckets["Services"] = "apiai-services";
})(S3Buckets || (exports.S3Buckets = S3Buckets = {}));
const bucketNameForTestFiles = S3Buckets.TestFiles;
exports.bucketNameForTestFiles = bucketNameForTestFiles;
const bucketNameForProjects = S3Buckets.Projects;
exports.bucketNameForProjects = bucketNameForProjects;
const bucketNameForUploads = S3Buckets.Uploads;
exports.bucketNameForUploads = bucketNameForUploads;
const bucketNameForServices = S3Buckets.Services;
exports.bucketNameForServices = bucketNameForServices;
//# sourceMappingURL=s3.js.map