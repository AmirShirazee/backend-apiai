enum S3Buckets {
  TestFiles = "apiai-testfiles",
  Projects = "apiai-projects",
  Uploads = "apiai-uploads",
  Services = "apiai-services",
}

const bucketNameForTestFiles = S3Buckets.TestFiles;
const bucketNameForProjects = S3Buckets.Projects;
const bucketNameForUploads = S3Buckets.Uploads;
const bucketNameForServices = S3Buckets.Services;

export {
  bucketNameForTestFiles,
  bucketNameForProjects,
  bucketNameForUploads,
  bucketNameForServices,
  S3Buckets,
};
