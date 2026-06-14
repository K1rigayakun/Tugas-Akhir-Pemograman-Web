import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { JwtService } from "./jwt.service";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return true; // Lanjut tanpa req.user
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = this.jwtService.verify(token);
      if (payload && payload.type === "access") {
        request.user = {
          id: payload.sub as string,
          email: payload.email as string,
          role: payload.role as string,
          adminRole: payload.adminRole as string | undefined,
        };
      }
    } catch (e) {
      // Ignore invalid token
    }

    return true;
  }
}
