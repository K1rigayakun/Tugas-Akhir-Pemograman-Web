"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let AuthThrottlerGuard = class AuthThrottlerGuard extends throttler_1.ThrottlerGuard {
    async throwThrottlingException() {
        throw new throttler_1.ThrottlerException('Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.');
    }
};
exports.AuthThrottlerGuard = AuthThrottlerGuard;
exports.AuthThrottlerGuard = AuthThrottlerGuard = __decorate([
    (0, common_1.Injectable)()
], AuthThrottlerGuard);
//# sourceMappingURL=auth-throttler.guard.js.map