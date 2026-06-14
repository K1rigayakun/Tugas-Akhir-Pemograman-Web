import { fetchApi } from "../../../lib/api";
import { serverGetApi } from "../../actions/apiProxy";
import LiveAuctionClient from "./LiveAuctionClient";

export default async function LiveAuctionPage({ params }: { params: { id: string } }) {
  // Fetch auction details
  const auction = await fetchApi<any>(`/auctions/${params.id}`, null);
  
  if (!auction) {
    return (
      <main className="page-wrap" style={{ minHeight: "100vh", padding: "6rem 2rem", textAlign: "center" }}>
        <h1>Lelang Tidak Ditemukan</h1>
      </main>
    );
  }

  // Fetch initial bids
  const initialBids = await fetchApi<any[]>(`/auctions/${params.id}/bids`, []);

  // Ambil profil user untuk di-pass ke socket
  let currentUser = null;
  try {
    const me = await serverGetApi<any>("/auth/me");
    if (me && me.id) currentUser = { id: me.id, username: me.username, rank: me.rank };
  } catch (e) {
    // Abaikan
  }

  return (
    <LiveAuctionClient 
      auction={auction} 
      initialBids={initialBids} 
      currentUser={currentUser} 
    />
  );
}
