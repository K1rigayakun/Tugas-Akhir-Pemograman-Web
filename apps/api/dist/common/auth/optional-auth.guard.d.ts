import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "./jwt.service";
export declare class OptionalAuthGuard implements CanActivate {
    private jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=optional-auth.guard.d.ts.map