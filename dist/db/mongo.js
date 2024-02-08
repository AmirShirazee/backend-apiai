"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const colors_1 = __importDefault(require("colors"));
mongoose_1.default.set('strictQuery', true);
const connectionString = 'mongodb+srv://root:root@cluster0.2v1s9.mongodb.net/ApiAi?retryWrites=true&w=majority';
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