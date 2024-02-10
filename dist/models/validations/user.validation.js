"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStrongPassword = exports.validatePassword = exports.validateEmail = exports.validateRegisterInput = exports.validateAdvancedLoginInput = exports.validateBasicLoginInput = void 0;
const joi_1 = __importDefault(require("joi"));
function validateBasicLoginInput(input) {
    const schema = joi_1.default.object({
        username: joi_1.default.string().min(3).max(50).required().label('Username'),
        password: joi_1.default.string().min(5).max(255).required().label('Password'),
    }).options({ allowUnknown: true }); // Allow unknown fields
    return schema.validate(input);
}
exports.validateBasicLoginInput = validateBasicLoginInput;
function validateAdvancedLoginInput(input) {
    const schema = joi_1.default.object({
        username: joi_1.default.string().min(3).max(50).required().label('Username').messages({
            'string.min': 'Username must have at least 3 characters.',
            'string.max': 'Username must have at most 50 characters.',
            'any.required': 'Username is required.',
        }),
        password: joi_1.default.string()
            .min(8)
            .max(255)
            .required()
            .pattern(/[a-zA-Z0-9!@#$%^&*()_+]/)
            .label('Password')
            .messages({
            'any.invalid': 'Password cannot be the same as the username.',
            'string.min': 'Password must have at least 8 characters.',
            'string.max': 'Password must have at most 255 characters.',
            'any.required': 'Password is required.',
        }),
    }).options({ allowUnknown: true }); // Allow unknown fields
    return schema.validate(input);
}
exports.validateAdvancedLoginInput = validateAdvancedLoginInput;
// Existing Register Input Validation
function validateRegisterInput(input) {
    const schema = joi_1.default.object({
        username: joi_1.default.string().min(3).max(50).required().label('Username'),
        email: joi_1.default.string()
            .email({ minDomainSegments: 2, tlds: { allow: true } }) // checks for '@' and a domain
            .min(5)
            .max(255)
            .required()
            .label('Email')
            .messages({
            'string.email': 'Email must be a valid email address.',
            'string.min': '"Email" must have at least 5 characters.',
            'string.max': '"Email" must have at most 255 characters.',
            'any.required': '"Email" is required.',
        }),
        password: joi_1.default.string()
            .min(8)
            .max(255)
            .required()
            .pattern(/^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+]+$/)
            .label('Password')
            .custom((value, helpers) => {
            var _a, _b;
            if (value === ((_b = (_a = helpers === null || helpers === void 0 ? void 0 : helpers.state) === null || _a === void 0 ? void 0 : _a.ancestors[0]) === null || _b === void 0 ? void 0 : _b.username)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
            .messages({
            'any.invalid': 'Password cannot be the same as the username or email.',
            'string.pattern.base': 'Password must contain at least one uppercase letter.',
        }),
    });
    return schema.validate(input);
}
exports.validateRegisterInput = validateRegisterInput;
// Existing Email Validation
function validateEmail(input) {
    const schema = joi_1.default.object({
        email: joi_1.default.string()
            .email({ minDomainSegments: 2, tlds: { allow: true } }) // checks for '@' and a domain
            .min(5)
            .max(255)
            .required()
            .label('Email')
            .messages({
            'string.email': 'Email must be a valid email address.',
            'string.min': '"Email" must have at least 5 characters.',
            'string.max': '"Email" must have at most 255 characters.',
            'any.required': '"Email" is required.',
        }),
    });
    return schema.validate(input);
}
exports.validateEmail = validateEmail;
// Existing Password Validation
function validatePassword(input) {
    const schema = joi_1.default.object({
        password: joi_1.default.string()
            .min(8)
            .max(255)
            .required()
            .pattern(/^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+]+$/)
            .label('Password')
            .messages({
            'any.invalid': 'Password cannot be an old password',
            'string.pattern.base': 'Password must contain at least one uppercase letter.',
        }),
    });
    return schema.validate(input);
}
exports.validatePassword = validatePassword;
function isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
    return (password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars);
}
exports.isStrongPassword = isStrongPassword;
//# sourceMappingURL=user.validation.js.map