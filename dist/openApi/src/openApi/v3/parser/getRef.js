"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRef = void 0;
const ESCAPED_REF_SLASH = /~1/g;
const ESCAPED_REF_TILDE = /~0/g;
const getRef = (openApi, item) => {
    if (item.$ref) {
        // Fetch the replacePathParameters to the definitions, this converts:
        // "#/components/schemas/Form" to ["components", "schemas", "Form"]
        const paths = item.$ref
            .replace(/^#/g, '')
            .split('/')
            .filter(item => item);
        // Try to find the reference by walking down the path,
        // if we cannot find it, then we throw an error.
        let result = openApi;
        paths.forEach(path => {
            const decodedPath = decodeURIComponent(path.replace(ESCAPED_REF_SLASH, '/').replace(ESCAPED_REF_TILDE, '~'));
            if (result.hasOwnProperty(decodedPath)) {
                result = result[decodedPath];
            }
            else {
                throw new Error(`Could not find reference: "${item.$ref}"`);
            }
        });
        return result;
    }
    return item;
};
exports.getRef = getRef;
//# sourceMappingURL=getRef.js.map