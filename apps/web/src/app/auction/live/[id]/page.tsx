import { fetchApi } from "../../../../lib/api";
import { serverGetApi } from "../../../actions/apiProxy";
import LiveAuctionClient from "../../[id]/LiveAuctionClient";
import { redirect } from "next/navigation";

/**
 * /auction/live/[id] — Redirect ke Live Room
 * Route ini memastikan user bisa langsung masuk ke halaman live auction
 * tanpa harus melalui /auction/[id] terlebih dahulu.
 */
export default async function LiveAuctionRoomPage({ params }: { params: { id: string } }) {
  const auction = await fetchApi<any>(`/auctions/${params.id}`, null);

  if (!auction) {
    return (
      <main className="page-wrap" style={{ minHeight: "100vh", padding: "6rem 2rem", textAlign: "center" }}>
        <h1 style={{ color: "var(--color-ivory)", fontFamily: "var(--font-cinzel)", fontSize: "2rem" }}>Lelang Tidak Ditemukan</h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>Lelang yang Anda cari tidak tersedia atau sudah dihapus.</p>
      </main>
    );
  }

  // Jika bukan tipe LIVE, redirect ke halaman auction biasa
  if (auction.auctionType !== "LIVE") {
    redirect(`/auction/${params.id}`);
  }

  // Fetch initial bids
  const initialBids = await fetchApi<any[]>(`/auctions/${params.id}/bids`, []);

  // Ambil profil user untuk WebSocket
  let currentUser = null;
  try {
    const me = await serverGetApi<any>("/auth/me");
    if (me && me.id) currentUser = { id: me.id, username: me.username, rank: me.rank };
  } catch (e) {
    // Tidak login - tetap bisa nonton sebagai spectator
  }

  return (
    <LiveAuctionClient
      auction={auction}
      initialBids={initialBids}
      currentUser={currentUser}
    />
  );
}
