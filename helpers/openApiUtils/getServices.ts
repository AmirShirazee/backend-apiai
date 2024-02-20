import fs from 'fs/promises';
import { join } from 'path';

export const getServicesList = async (rootDirectory: string) => {
  const servicesList = [];
  const directory = join(rootDirectory, 'services');

  console.log(`Checking if services directory exists: ${directory}`);
  // Check if the directory exists
  try {
    await fs.access(directory);
  } catch (error) {
    throw new Error(`Services directory not found: ${directory}`);
  }

  console.log(`Reading services directory: ${directory}`);
  // Read the directory to find service files
  let files;
  try {
    files = await fs.readdir(directory);
    console.log(`Found files in services directory: ${files.join(', ')}`);
  } catch (error) {
    throw new Error(`Error reading services directory: ${directory}`);
  }

  // Filter or identify service files by naming convention or other means
  const serviceFiles = files.filter(
    (file) => file.endsWith('Service.ts') || file.endsWith('Service.js'),
  );
  console.log(`Service files identified: ${serviceFiles.join(', ')}`);

  // Dynamically import each service file
  for (const file of serviceFiles) {
    const filePath = join(directory, file);
    console.log(`Importing service from file: ${filePath}`);
    try {
      const module = await import(filePath);
      for (const key in module) {
        if (key.endsWith('Service')) {
          const service = module[key];
          console.log(`Processing service: ${key}`);
          for (const methodName of Object.getOwnPropertyNames(service)) {
            const possibleMethod = service[methodName];
            if (typeof possibleMethod === 'function') {
              console.log(`Adding to servicesList: Service - ${key}, Method - ${methodName}`);
              servicesList.push({
                service: key,
                method: methodName,
                methodFunc: possibleMethod,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error importing service from ${filePath}: ${error}`);
      // Optionally, continue to the next file or handle the error as needed
    }
  }

  console.log(`Total services processed: ${servicesList.length}`);
  return servicesList;
};
