"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ramda_1 = require("ramda");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
    },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Date, default: null },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    didUpload: {
        type: Boolean,
        default: false,
    },
    uploadedAtDate: {
        type: Date,
        default: null,
    },
    project: {
        type: Boolean,
        default: false,
    },
    passwordResetAttempts: {
        timestamps: { type: [Date], default: [] },
        count: { type: Number, default: 0 },
        lastEvaluated: { type: Date, default: new Date(0) },
    },
    editorSettings: {
        readOnly: { type: Boolean, default: true },
        showLineNumbers: { type: Boolean, default: true },
        tabSize: { type: Number, default: 2 },
        useWorker: { type: Boolean, default: false },
        displayIndentGuides: { type: Boolean, default: true },
        highlightActiveLine: { type: Boolean, default: false },
        highlightSelectedWord: { type: Boolean, default: false },
    },
});
userSchema.methods.comparePassword = async function (password) {
    return await bcryptjs_1.default.compare(password, this.password);
};
userSchema.methods.hashPassword = async function () {
    return new Promise((resolve, reject) => {
        bcryptjs_1.default.genSalt(10, (err1, salt) => {
            if (err1) {
                reject(new Error('Failed to generate salt.'));
                return;
            }
            bcryptjs_1.default.hash(this.password, salt, (err2, hash) => {
                if (err2) {
                    reject(new Error('Failed to hash password.'));
                    return;
                }
                this.password = hash;
                resolve(hash);
            });
        });
    });
};
userSchema.methods.sanitizeUser = function () {
    return (0, ramda_1.omit)(['password', '__v', '_id'], this.toObject({ virtuals: true }));
};
userSchema.statics.findByToken = function (tokenObject, callback) {
    return this.findOne({ token: tokenObject.token }, callback);
};
exports.User = mongoose_1.default.models.User || (0, mongoose_1.model)('User', userSchema);
exports.default = exports.User;
//# sourceMappingURL=user.model.js.map