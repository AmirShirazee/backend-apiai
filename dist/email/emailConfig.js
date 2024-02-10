"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendingEmail = exports.protocol = exports.host = void 0;
const getEnvVar_1 = __importDefault(require("../utils/getEnvVar"));
exports.host = (0, getEnvVar_1.default)('NODE_ENV') === 'production' ? (0, getEnvVar_1.default)('BASE_URL') : (0, getEnvVar_1.default)('LOCAL_HOST');
exports.protocol = (0, getEnvVar_1.default)('NODE_ENV') === 'production' ? 'https' : 'http';
exports.sendingEmail = (0, getEnvVar_1.default)('EMAIL_FROM');
//# sourceMappingURL=emailConfig.js.map