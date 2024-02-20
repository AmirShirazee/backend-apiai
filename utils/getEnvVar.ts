function getEnvVar(key: string): string {
  const value = process.env[key];
  if (typeof value === 'undefined' || value === null) {
    console.error(`Environment variable ${key} is not set. Terminating process.`);
    process.exit(1); // Exit with a failure code
  }
  return value;
}

export default getEnvVar;
