import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import AnimatedSection from "../../components/AnimatedSection";
import PageHeading from "../../components/PageHeading";
import AuctionCatalog from "../../components/auction/AuctionCatalog";
import { serverGetApi } from "../actions/apiProxy";

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

  // Hanya tampilkan lelang yang belum ENDED
  const activeAuctions = auctions.filter((auction) => {
    return auction.status !== "ENDED";
  });

  const isKycApproved = kycStatus === "APPROVED";

  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="The Grand Colosseum"
        title="Auctions Open for Glory"
        description="Telusuri lelang aktif, bandingkan relik, dan siapkan bid sebelum waktu berakhir."
      />

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
        <AuctionCatalog
          initialAuctions={activeAuctions}
          kycApproved={isKycApproved}
        />
      </AnimatedSection>
    </main>
  );
}
