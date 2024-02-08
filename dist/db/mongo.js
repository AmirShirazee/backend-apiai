"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const colors_1 = __importDefault(require("colors"));
const isProd_1 = require("../utils/isProd");
mongoose_1.default.set('strictQuery', true);
const LOCAL_MONGO_DB = 'mongodb://127.0.0.1:27017/localApiAi';
const AZURE_COSMOS_DB = 'mongodb://testgenerator-server:CTDzcIpWuy2eipa2ZSPTG1p9dErO6ReZuBUu4KBHphuy4pDRN8TmsUWnHqRbsgDtiXGedFlaVkkAACDbQOEzGQ==@testgenerator-server.mongo.cosmos.azure.com:10255/testgenerator-database?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@testgenerator-server@';
const connectionString = isProd_1.isProduction ? AZURE_COSMOS_DB : LOCAL_MONGO_DB;
if (!connectionString) {
    console.error(colors_1.default.red.underline('No DB connection string found. Please set the DB. Process exiting...'));
    process.exit(1);
}
const connectDB = async () => {
    const connect = {
        maxPoolSize: 2,
    };
    try {
        const conn = await mongoose_1.default.connect(connectionString, connect);
        console.info(colors_1.default.green.underline(`MongoDB Connected: ${conn.connection.host}`));
    }
    catch (error) {
        console.error(colors_1.default.red.underline(`Error: ${error.message}`));
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=mongo.js.map