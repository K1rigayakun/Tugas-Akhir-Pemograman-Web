import { createHmac } from "crypto";

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
export enum AgoraRole {
  /** Publisher — bisa kirim audio/video (host lelang) */
  PUBLISHER = 1,
  /** Subscriber — hanya bisa terima audio/video (penonton) */
  SUBSCRIBER = 2,
}

/** Privilege types */
const Privileges = {
  kJoinChannel: 1,
  kPublishAudioStream: 2,
  kPublishVideoStream: 3,
  kPublishDataStream: 4,
} as const;

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
export function buildRtcToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: AgoraRole,
  privilegeExpiredTs: number,
): string {
  // Build message
  const privileges: Record<number, number> = {};
  privileges[Privileges.kJoinChannel] = privilegeExpiredTs;

  if (role === AgoraRole.PUBLISHER) {
    privileges[Privileges.kPublishAudioStream] = privilegeExpiredTs;
    privileges[Privileges.kPublishVideoStream] = privilegeExpiredTs;
    privileges[Privileges.kPublishDataStream] = privilegeExpiredTs;
  }

  // Pack privileges into message
  const messageBuf = packPrivileges(privileges);

  // Build token content
  const uidStr = uid === 0 ? "" : String(uid);
  const timestamp = Math.floor(Date.now() / 1000);
  const salt = Math.floor(Math.random() * 99999999) + 1;

  // Signature = HMAC-SHA256(appCertificate, appId + channelName + uidStr + messageBuf)
  const toSign = `${appId}${channelName}${uidStr}${messageBuf}`;
  const signature = createHmac("sha256", appCertificate)
    .update(toSign)
    .digest("base64");

  // Token format: 007 + base64(appId + signature + timestamp + salt + privileges)
  const content = JSON.stringify({
    appId,
    signature,
    ts: timestamp,
    salt,
    privileges,
    channelName,
    uid: uidStr,
  });

  const token = `007${Buffer.from(content).toString("base64")}`;
  return token;
}

function packPrivileges(privileges: Record<number, number>): string {
  // Simple JSON representation for signing
  return JSON.stringify(privileges);
}

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
export function generateAuctionToken(
  appId: string,
  appCertificate: string,
  auctionId: string,
  uid: number = 0,
  isHost: boolean = false,
  ttlSeconds: number = 3600,
): {
  appId: string;
  token: string;
  channel: string;
  uid: number;
  role: string;
  expiresAt: string;
} {
  const role = isHost ? AgoraRole.PUBLISHER : AgoraRole.SUBSCRIBER;
  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + ttlSeconds;

  const channelName = `ek-auction-${auctionId}`;
  const token = buildRtcToken(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs,
  );

  return {
    appId,
    token,
    channel: channelName,
    uid,
    role: isHost ? "host" : "audience",
    expiresAt: new Date(privilegeExpiredTs * 1000).toISOString(),
  };
}
