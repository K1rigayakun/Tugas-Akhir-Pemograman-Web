/**
 * AgoraTokenBuilder — Generate RTC token untuk Agora video streaming.
 *
 * Implementasi berdasarkan spesifikasi Agora Token v007:
 * https://docs.agora.io/en/video-calling/develop/authentication-workflow
 *
 * Token ini digunakan oleh client untuk join Agora channel.
 * Setiap token punya expiry time dan privilege.
 *
 * Privilege:
 * - kJoinChannel (1): Izin join channel
 * - kPublishAudioStream (2): Izin kirim audio
 * - kPublishVideoStream (3): Izin kirim video
 * - kPublishDataStream (4): Izin kirim data
 */
/** Role user dalam channel */
export declare enum AgoraRole {
    /** Publisher — bisa kirim audio/video (host lelang) */
    PUBLISHER = 1,
    /** Subscriber — hanya bisa terima audio/video (penonton) */
    SUBSCRIBER = 2
}
/**
 * Build Agora RTC token.
 *
 * @param appId - Agora App ID
 * @param appCertificate - Agora App Certificate (secret)
 * @param channelName - Nama channel (auctionId)
 * @param uid - User ID (0 untuk dynamic)
 * @param role - PUBLISHER (host) atau SUBSCRIBER (penonton)
 * @param privilegeExpiredTs - Unix timestamp kapan token expired
 */
export declare function buildRtcToken(appId: string, appCertificate: string, channelName: string, uid: number, role: AgoraRole, privilegeExpiredTs: number): string;
/**
 * Helper — Generate token untuk auction channel.
 *
 * @param appId - Agora App ID
 * @param appCertificate - Agora App Certificate
 * @param auctionId - ID lelang (dipakai sebagai channel name)
 * @param uid - User ID (0 untuk dynamic assignment)
 * @param isHost - true kalau user adalah host/admin
 * @param ttlSeconds - Berapa lama token valid (default: 1 jam)
 */
export declare function generateAuctionToken(appId: string, appCertificate: string, auctionId: string, uid?: number, isHost?: boolean, ttlSeconds?: number): {
    appId: string;
    token: string;
    channel: string;
    uid: number;
    role: string;
    expiresAt: string;
};
//# sourceMappingURL=agora-token.builder.d.ts.map