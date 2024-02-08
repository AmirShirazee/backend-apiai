"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function logDirectoryTree(dir, prefix = "") {
    fs_1.default.readdirSync(dir).forEach((file) => {
        const filePath = path_1.default.join(dir, file);
        const stats = fs_1.default.lstatSync(filePath);
        if (stats.isDirectory()) {
            console.log(prefix + "📁 " + file);
            logDirectoryTree(filePath, prefix + "  ");
        }
        else {
            console.log(prefix + "📄 " + file);
        }
    });
}
exports.default = logDirectoryTree;
//# sourceMappingURL=tmpFolder.js.map