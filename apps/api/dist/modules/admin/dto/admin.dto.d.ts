export { CreateAuctionDto } from "./create-auction.dto";
/** POST /admin/users/:id/warn */
export declare class WarnUserDto {
    reason: string;
}
/** POST /admin/users/:id/suspend */
export declare class SuspendUserDto {
    reason: string;
    durationDays: number;
}
/** POST /admin/users/:id/ban-auction, /ban-permanent */
export declare class BanUserDto {
    reason: string;
}
/** POST /admin/auctions/:id/cancel */
export declare class CancelAuctionDto {
    reason: string;
}
/** POST /admin/kyc/:id/reject */
export declare class RejectKYCDto {
    notes: string;
}
/** POST /admin/museum/items/:auctionId */
export declare class CurateMuseumDto {
    editorial: string;
}
/** POST /admin/events */
export declare class CreateEventDto {
    name: string;
    theme: string;
    backgroundMode?: string;
    accentColors?: string[];
    expMultiplier: number;
    startTime: string;
    endTime: string;
}
export declare class PaginationDto {
    page?: number;
    limit?: number;
}
//# sourceMappingURL=admin.dto.d.ts.map