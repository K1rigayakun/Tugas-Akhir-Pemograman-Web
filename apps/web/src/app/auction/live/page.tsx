import AnimatedSection from "../../../components/AnimatedSection";
import PageHeading from "../../../components/PageHeading";
import AuctionGrid from "../../../components/auction/AuctionGrid";
import AuctionSubnav from "../../../components/auction/AuctionSubnav";
import { serverGetApi } from "../../actions/apiProxy";

export default async function LiveAuctionListPage() {
  let auctions: any[] = [];
  try {
    auctions = await serverGetApi<any[]>("/auctions/live");
  } catch (err) {
    console.error("Failed to fetch live auctions:", err);
  }

  let kycApproved = false;
  try {
    const kyc = await serverGetApi<{ status: string }>("/kyc/status");
    kycApproved = kyc?.status === "APPROVED";
  } catch {
    kycApproved = false;
  }

  const sortedAuctions = auctions.sort((a, b) => {
    const aLive = a.status === "ACTIVE" || a.status === "ENDING";
    const bLive = b.status === "ACTIVE" || b.status === "ENDING";
    if (aLive && !bLive) return -1;
    if (!aLive && bLive) return 1;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="Imperial Broadcast"
        title="Lelang Live"
        description="Masuk ke ruang live yang sedang berlangsung atau bersiap untuk jadwal berikutnya."
      />
      <AuctionSubnav />
      <AnimatedSection delay={120}>
        <AuctionGrid
          auctions={sortedAuctions}
          emptyMessage="Tidak ada lelang live yang sedang atau akan berlangsung."
          kycApproved={kycApproved}
        />
      </AnimatedSection>
    </main>
  );
}
