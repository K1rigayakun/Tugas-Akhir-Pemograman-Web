import AnimatedSection from "../../../components/AnimatedSection";
import PageHeading from "../../../components/PageHeading";
import AuctionGrid from "../../../components/auction/AuctionGrid";
import AuctionSubnav from "../../../components/auction/AuctionSubnav";
import { serverGetApi } from "../../actions/apiProxy";

const RANK_ORDER = [
  "CIVIS",
  "MERCHANT",
  "KNIGHT",
  "BARON",
  "VISCOUNT",
  "EARL",
  "MARQUIS",
  "DUKE",
  "SOVEREIGN",
  "EMPEROR",
];

function canAccessRank(userRank: string, minimumRank?: string | null) {
  if (!minimumRank) return true;
  const userIndex = RANK_ORDER.indexOf(userRank);
  const requiredIndex = RANK_ORDER.indexOf(minimumRank);
  if (userIndex < 0 || requiredIndex < 0) return false;
  return userIndex >= requiredIndex;
}

export default async function ExclusiveAuctionPage() {
  let auctions: any[] = [];
  try {
    auctions = await serverGetApi<any[]>("/auctions/exclusive");
  } catch (err) {
    console.error("Failed to fetch exclusive auctions:", err);
  }

  let userRank = "CIVIS";
  let kycApproved = false;
  try {
    const me = await serverGetApi<{ rank?: string; kycStatus?: string }>("/auth/me");
    userRank = me?.rank || "CIVIS";
    kycApproved = me?.kycStatus === "APPROVED";
  } catch {
    userRank = "CIVIS";
  }

  const rankedAuctions = auctions.map((auction) => {
    const hasRank = canAccessRank(userRank, auction.minimumRank);
    return {
      ...auction,
      locked: !hasRank,
      lockReason: hasRank ? undefined : `Butuh rank ${auction.minimumRank}`,
    };
  });

  return (
    <main className="page-wrap">
      <PageHeading
        eyebrow="Noble Chambers"
        title="Lelang Eksklusif"
        description="Relik premium untuk rank tertentu. Item yang belum memenuhi rank tetap terlihat sebagai target progression."
      />
      <AuctionSubnav />
      <AnimatedSection delay={120}>
        <AuctionGrid
          auctions={rankedAuctions}
          emptyMessage="Belum ada lelang eksklusif yang tersedia."
          kycApproved={kycApproved}
        />
      </AnimatedSection>
    </main>
  );
}
