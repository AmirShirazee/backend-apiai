"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUploadFile = void 0;
const validators_1 = require("../openApi/utils/validators");
const validateUploadFile = (uploadFile) => {
    if (!(0, validators_1.isOpenApiSpec)(uploadFile)) {
        throw new Error('The uploaded file does not adhere to the OpenAPI v3 specification');
    }
};
exports.validateUploadFile = validateUploadFile;
//# sourceMappingURL=validateUploadFile.js.map