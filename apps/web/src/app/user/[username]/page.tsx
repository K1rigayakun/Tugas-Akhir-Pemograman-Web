import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { prisma } from "@emerald-kingdom/db";
import CosmeticAvatar from "../../../components/cosmetics/CosmeticAvatar";
import CosmeticName from "../../../components/cosmetics/CosmeticName";
import CosmeticCard from "../../../components/cosmetics/CosmeticCard";
import PageHeading from "../../../components/PageHeading";
import AnimatedSection from "../../../components/AnimatedSection";
import { resolvePrivacyPreferences } from "../../../lib/userPreferences";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: decodeURIComponent(params.username) },
    select: {
      id: true,
      username: true,
      rank: true,
      totalExp: true,
      totalWins: true,
      totalBids: true,
      winStreak: true,
      longestStreak: true,
      avatarUrl: true,
      privacyMode: true,
      notificationPrefs: true,
      hiddenVaultItems: true,
      createdAt: true,
      activeCoatFrame: true,
      activeNameEffect: true,
      activeBannerId: true,
      cosmetics: {
        include: { cosmetic: true },
      },
      wonAuctions: {
        orderBy: { endTime: "desc" },
        select: {
          id: true,
          title: true,
          rarity: true,
          finalPrice: true,
          imageUrls: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const privacy = resolvePrivacyPreferences(user.notificationPrefs);
  let hiddenItems = { cosmetics: [] as string[], auctions: [] as string[] };
  if (user.hiddenVaultItems && typeof user.hiddenVaultItems === "object" && !Array.isArray(user.hiddenVaultItems)) {
    hiddenItems = user.hiddenVaultItems as { cosmetics?: string[]; auctions?: string[] } as typeof hiddenItems;
  }
  hiddenItems.cosmetics ||= [];
  hiddenItems.auctions ||= [];

  if (user.privacyMode === "SHADOW") {
    return (
      <main className="page-wrap" style={{ minHeight: "100vh", padding: "6rem 2rem" }}>
        <PageHeading
          eyebrow="Private Profile"
          title="Profil Tidak Tersedia"
          description="Pengguna ini mengaktifkan mode Shadow."
        />
      </main>
    );
  }

  const publicName = user.privacyMode === "ANONYMOUS" ? privacy.anonymousName : user.username;
  const frame = user.activeCoatFrame
    ? user.cosmetics.find((item) => item.cosmetic.id === user.activeCoatFrame)?.cosmetic
    : null;
  const nameEffect = user.activeNameEffect
    ? user.cosmetics.find((item) => item.cosmetic.id === user.activeNameEffect)?.cosmetic
    : null;
  const banner = user.activeBannerId
    ? user.cosmetics.find((item) => item.cosmetic.id === user.activeBannerId)?.cosmetic
    : null;

  const winRate = user.totalBids > 0 ? Math.round((user.totalWins / user.totalBids) * 100) : 0;
  const publicCosmetics = user.cosmetics.filter((item) => !hiddenItems.cosmetics.includes(item.cosmetic.id));
  const publicAuctions = user.wonAuctions.filter((auction) => !hiddenItems.auctions.includes(auction.id));
  const joinedAt = user.createdAt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="page-wrap" style={{ minHeight: "100vh", padding: "6rem 2rem" }}>
      <PageHeading
        eyebrow="Public Profile"
        title={`Profil: ${publicName}`}
        description="Melihat profil dan koleksi publik pengguna Emerald Kingdom."
      />

      <AnimatedSection delay={200}>
        <div style={{ maxWidth: "980px", margin: "3rem auto 0" }}>
          <CosmeticCard
            userId={user.id}
            webCode={banner?.webCode || ""}
            style={{
              padding: "2.5rem",
              borderRadius: "8px",
              background: banner?.imageUrl
                ? `linear-gradient(90deg, rgba(5,5,8,0.86), rgba(5,5,8,0.62)), url(${banner.imageUrl}) center / cover`
                : "rgba(10, 12, 14, 0.84)",
              border: "1px solid rgba(201,168,76,0.22)",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <CosmeticAvatar
              userId={user.id}
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(publicName)}&background=0d3b2e&color=f5f0e8`}
              size={112}
              frameWebCode={frame?.webCode || ""}
              splineUrl={frame?.splineUrl || ""}
            />

            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>
                <CosmeticName userId={user.id} name={publicName} webCode={nameEffect?.webCode || ""} />
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {privacy.showRankExp && (
                  <Badge label={`Rank: ${user.rank}`} />
                )}
                {privacy.showBidStats && (
                  <>
                    <Badge label={`Wins: ${user.totalWins}`} />
                    <Badge label={`Win Rate: ${winRate}%`} />
                  </>
                )}
                {privacy.showJoinedAt && (
                  <Badge label={`Bergabung: ${joinedAt}`} />
                )}
              </div>
            </div>
          </CosmeticCard>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
            {privacy.showBidStats && (
              <Panel title="Statistik">
                <Metric label="Total Bid" value={user.totalBids.toLocaleString("id-ID")} />
                <Metric label="Win Streak" value={user.winStreak.toLocaleString("id-ID")} />
                <Metric label="Longest Streak" value={user.longestStreak.toLocaleString("id-ID")} />
              </Panel>
            )}

            {privacy.showWonItems && (
              <Panel title="Item Kemenangan">
                <ItemList
                  empty="Belum ada item publik."
                  items={publicAuctions.slice(0, 6).map((auction) => ({
                    id: auction.id,
                    name: auction.title,
                    meta: `${auction.rarity} · ${auction.finalPrice || 0} CC`,
                  }))}
                />
              </Panel>
            )}

            {privacy.showCosmetics && (
              <Panel title="Koleksi Kosmetik">
                <ItemList
                  empty="Belum ada kosmetik publik."
                  items={publicCosmetics.slice(0, 6).map((item) => ({
                    id: item.cosmetic.id,
                    name: item.cosmetic.name,
                    meta: `${item.cosmetic.rarity} · ${item.cosmetic.type}`,
                  }))}
                />
              </Panel>
            )}
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span style={{
      padding: "6px 10px",
      background: "rgba(201,168,76,0.12)",
      color: "var(--color-gold-light)",
      border: "1px solid rgba(201,168,76,0.22)",
      borderRadius: "4px",
      fontSize: "0.8rem",
      fontWeight: 700,
    }}>
      {label}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel" style={{ padding: "1.25rem" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--color-gold-light)" }}>{title}</h3>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.65rem 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <span style={{ color: "rgba(245,240,232,0.58)" }}>{label}</span>
      <strong style={{ color: "var(--color-ivory)" }}>{value}</strong>
    </div>
  );
}

function ItemList({
  items,
  empty,
}: {
  items: Array<{ id: string; name: string; meta: string }>;
  empty: string;
}) {
  if (items.length === 0) {
    return <p style={{ color: "rgba(245,240,232,0.55)" }}>{empty}</p>;
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {items.map((item) => (
        <div key={item.id} style={{ padding: "0.75rem", background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px" }}>
          <div style={{ color: "var(--color-ivory)", fontWeight: 700 }}>{item.name}</div>
          <div style={{ color: "rgba(245,240,232,0.45)", fontSize: "0.78rem", marginTop: "0.2rem" }}>{item.meta}</div>
        </div>
      ))}
    </div>
  );
}
