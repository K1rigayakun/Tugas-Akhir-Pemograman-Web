import AnimatedSection from "../../../components/AnimatedSection";
import PageHeading from "../../../components/PageHeading";
import AuctionGrid from "../../../components/auction/AuctionGrid";
import AuctionSubnav from "../../../components/auction/AuctionSubnav";
import { serverGetApi } from "../../actions/apiProxy";

interface EventAuctionResponse {
  event: {
    name: string;
    theme: string;
    expMultiplier: number;
    endTime: string;
  } | null;
  auctions: any[];
}

export default async function EventAuctionPage() {
  let data: EventAuctionResponse = { event: null, auctions: [] };
  try {
    data = await serverGetApi<EventAuctionResponse>("/auctions/event");
  } catch (err) {
    console.error("Failed to fetch event auctions:", err);
  }

  let kycApproved = false;
  try {
    const kyc = await serverGetApi<{ status: string }>("/kyc/status");
    kycApproved = kyc?.status === "APPROVED";
  } catch {
    kycApproved = false;
  }

  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow={data.event ? data.event.theme : "Seasonal Court"}
        title={data.event ? data.event.name : "Lelang Event"}
        description={
          data.event
            ? `Event aktif dengan multiplier EXP x${data.event.expMultiplier}. Rekomendasi event ditampilkan lebih dulu.`
            : "Tidak ada event aktif saat ini. Halaman ini akan otomatis terisi ketika event dimulai."
        }
      />
      <AuctionSubnav />
      <AnimatedSection delay={120}>
        <AuctionGrid
          auctions={data.auctions.map((auction) => ({ ...auction, badge: "EVENT" }))}
          emptyMessage="Tidak ada lelang event yang aktif sekarang."
          kycApproved={kycApproved}
        />
      </AnimatedSection>
    </main>
  );
}
