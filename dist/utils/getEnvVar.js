"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getEnvVar(key) {
    const value = process.env[key];
    if (typeof value === 'undefined' || value === null) {
        console.error(`Environment variable ${key} is not set. Terminating process.`);
        process.exit(1); // Exit with a failure code
    }
    return value;
}
exports.default = getEnvVar;
//# sourceMappingURL=getEnvVar.js.map