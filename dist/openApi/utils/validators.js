"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOpenApiSpec = exports.isValidOpenApiV3 = void 0;
const isValidOpenApiV3 = (obj) => {
    if (!obj)
        return false;
    if (!obj.openapi || !obj.openapi.startsWith("3."))
        return false;
    if (!obj.info || typeof obj.info !== "object")
        return false;
    return !(!obj.paths || typeof obj.paths !== "object");
};
exports.isValidOpenApiV3 = isValidOpenApiV3;
function isOpenApiSpec(object) {
    return object && object.openapi && object.info && object.paths;
}
exports.isOpenApiSpec = isOpenApiSpec;
//# sourceMappingURL=validators.js.map