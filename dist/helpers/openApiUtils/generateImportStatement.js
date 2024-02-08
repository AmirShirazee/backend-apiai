"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImportStatement = void 0;
const generateImportStatement = (serviceImports) => {
    const imports = Array.from(serviceImports).join(",\n  ");
    return `import {${imports}} from './services';`;
};
exports.generateImportStatement = generateImportStatement;
//# sourceMappingURL=generateImportStatement.js.map