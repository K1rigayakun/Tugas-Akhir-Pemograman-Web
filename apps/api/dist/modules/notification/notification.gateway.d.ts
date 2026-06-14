import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    /**
     * Broadcast a global announcement (e.g., Emperor Rank Up)
     */
    broadcastGlobalAnnouncement(message: string, data: any): void;
    /**
     * Send a specific notification to a user room
     */
    notifyUser(userId: string, type: string, payload: any): void;
}
//# sourceMappingURL=notification.gateway.d.ts.map