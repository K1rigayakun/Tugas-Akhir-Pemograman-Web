import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { WS_EVENTS } from "@emerald-kingdom/types";

export interface BidData {
  userId: string;
  username: string;
  amount: number;
  rank: string;
  timestamp: string;
  activeNameEffect?: string | null;
  activeCoatFrame?: string | null;
  avatarUrl?: string | null;
}

export function useLiveAuction(auctionId: string, userId?: string, rank?: string) {
  const [bids, setBids] = useState<BidData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [winner, setWinner] = useState<{ winnerId: string; finalPrice: number } | null>(null);
  const [outbidMessage, setOutbidMessage] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const lastOwnBidAmountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    // Inisialisasi socket dengan namespace /live-auction
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3001";
    const socket = io(`${socketUrl}/live-auction`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Join room
      socket.emit(WS_EVENTS.JOIN_AUCTION, { auctionId, userId, rank });
    });

    socket.on(WS_EVENTS.BID_NEW, (data: BidData & { auctionId: string }) => {
      if (data.auctionId === auctionId) {
        setBids((prev) => [data, ...prev]);
        setCurrentPrice(data.amount);

        if (data.userId === userId) {
          lastOwnBidAmountRef.current = data.amount;
          setOutbidMessage(null);
        } else if (
          lastOwnBidAmountRef.current !== null &&
          data.amount > lastOwnBidAmountRef.current
        ) {
          setOutbidMessage(`${data.username} melewati bid Anda dengan ${data.amount.toLocaleString("id-ID")} CC.`);
        }
      }
    });

    socket.on(WS_EVENTS.VIEWER_COUNT, (data: { auctionId: string; count: number }) => {
      if (data.auctionId === auctionId) setViewerCount(data.count);
    });

    socket.on(WS_EVENTS.TIMER_UPDATE, (data: { auctionId: string; endTime: string }) => {
      if (data.auctionId === auctionId) setEndTime(data.endTime);
    });

    socket.on(WS_EVENTS.TIMER_EXTENDED, (data: { auctionId: string; endTime: string }) => {
      if (data.auctionId === auctionId) {
        setEndTime(data.endTime);
        // Bisa trigger animasi "Anti-snipe" di UI
      }
    });

    socket.on(WS_EVENTS.AUCTION_ENDED, (data: { auctionId: string; winnerId: string; finalPrice: number }) => {
      if (data.auctionId === auctionId) {
        setIsEnded(true);
        setWinner({ winnerId: data.winnerId, finalPrice: data.finalPrice });
      }
    });

    return () => {
      socket.emit(WS_EVENTS.LEAVE_AUCTION, { auctionId });
      socket.disconnect();
    };
  }, [auctionId, userId, rank]);

  const placeBid = (amount: number, username: string) => {
    if (!socketRef.current || !userId) return;
    socketRef.current.emit(WS_EVENTS.PLACE_BID, {
      auctionId,
      userId,
      amount,
      username,
      rank: rank || "CIVIS",
    }, (response: any) => {
      if (response && !response.success) {
        if (typeof response.error === 'string' && response.error.includes("ADDRESS_REQUIRED")) {
          if (window.confirm("Anda belum mengatur Alamat Pengiriman. Apakah Anda ingin mengaturnya sekarang?")) {
            window.location.href = "/settings/address";
          }
        } else {
          alert(response.error || "Gagal memasang bid");
        }
      }
    });
  };

  const placePhantomBid = async (maxAmount: number) => {
    if (!userId) return { success: false, error: "Silakan login." };
    try {
      const { placePhantomBidAction } = await import("../app/actions/auction");
      return await placePhantomBidAction(auctionId, maxAmount);
    } catch (error: any) {
      return { success: false, error: error.message || "Gagal memasang Phantom Bid." };
    }
  };

  return {
    bids,
    currentPrice,
    setCurrentPrice, // allow manual init from server data
    viewerCount,
    endTime,
    setEndTime, // allow manual init
    isEnded,
    winner,
    outbidMessage,
    clearOutbidMessage: () => setOutbidMessage(null),
    placeBid,
    placePhantomBid
  };
}
