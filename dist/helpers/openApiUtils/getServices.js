"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicesList = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = require("path");
const getServicesList = async (rootDirectory) => {
    const servicesList = [];
    const directory = (0, path_1.join)(rootDirectory, 'services');
    console.log(`Checking if services directory exists: ${directory}`);
    // Check if the directory exists
    try {
        await promises_1.default.access(directory);
    }
    catch (error) {
        throw new Error(`Services directory not found: ${directory}`);
    }
    console.log(`Reading services directory: ${directory}`);
    // Read the directory to find service files
    let files;
    try {
        files = await promises_1.default.readdir(directory);
        console.log(`Found files in services directory: ${files.join(', ')}`);
    }
    catch (error) {
        throw new Error(`Error reading services directory: ${directory}`);
    }
    // Filter or identify service files by naming convention or other means
    const serviceFiles = files.filter((file) => file.endsWith('Service.ts') || file.endsWith('Service.js'));
    console.log(`Service files identified: ${serviceFiles.join(', ')}`);
    // Dynamically import each service file
    for (const file of serviceFiles) {
        const filePath = (0, path_1.join)(directory, file);
        console.log(`Importing service from file: ${filePath}`);
        try {
            const module = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
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
        }
        catch (error) {
            console.error(`Error importing service from ${filePath}: ${error}`);
            // Optionally, continue to the next file or handle the error as needed
        }
    }
    console.log(`Total services processed: ${servicesList.length}`);
    return servicesList;
};
exports.getServicesList = getServicesList;
//# sourceMappingURL=getServices.js.map