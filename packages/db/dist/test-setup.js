"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Test setup file - loads environment variables from .env file
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// Load .env from project root
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, '../../../.env') });
//# sourceMappingURL=test-setup.js.map