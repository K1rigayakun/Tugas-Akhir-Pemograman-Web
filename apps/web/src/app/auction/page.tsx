import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import AnimatedSection from "../../components/AnimatedSection";
import PageHeading from "../../components/PageHeading";
import AuctionGrid from "../../components/auction/AuctionGrid";
import AuctionSubnav from "../../components/auction/AuctionSubnav";
import { serverGetApi } from "../actions/apiProxy";

const STANDARD_TYPES = new Set(["STANDARD", "SCHEDULED", "SEALED_CHEST", "DESCENDING"]);
const LIST_STATUSES = new Set(["ACTIVE", "ENDING", "UPCOMING"]);

export default async function AuctionPage() {
  let auctions: any[] = [];
  try {
    auctions = await serverGetApi<any[]>("/auctions");
  } catch (err) {
    console.error("Failed to fetch auctions:", err);
  }

  let kycStatus = "UNVERIFIED";
  try {
    const res = await serverGetApi<{ status: string }>("/kyc/status");
    if (res?.status) kycStatus = res.status;
  } catch {
    // Guest users can still browse auction cards.
  }

  const standardAuctions = auctions.filter((auction) => {
    const type = auction.auctionType || "STANDARD";
    return STANDARD_TYPES.has(type) && LIST_STATUSES.has(auction.status || "ACTIVE");
  });

  const isKycApproved = kycStatus === "APPROVED";

  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="The Grand Colosseum"
        title="Auctions Open for Glory"
        description="Telusuri lelang aktif, bandingkan relik, dan siapkan bid sebelum waktu berakhir."
      />

      <AuctionSubnav />

      {!isKycApproved && (
        <AnimatedSection delay={100}>
          <div className="panel status-message error" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={18} /> Verifikasi Identitas (KYC) dibutuhkan untuk ikut bid.
            </span>
            <Link href="/kyc" className="primary-action" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
              Verifikasi Sekarang
            </Link>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={160}>
        <AuctionGrid
          auctions={standardAuctions}
          emptyMessage="Tidak ada lelang biasa yang tersedia saat ini."
          kycApproved={isKycApproved}
        />
      </AnimatedSection>
    </main>
  );
}
