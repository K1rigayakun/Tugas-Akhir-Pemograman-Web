import { redirect } from "next/navigation";
import { getSessionUser } from "../actions/session";
import { prisma } from "@emerald-kingdom/db";
import Link from "next/link";
import { ShieldEmblem, ImperialEagle, SettingsGear, ImperialNameCardBg, AvatarSilhouette, CrossedSwords } from "../../components/LuxurySVGs";

import ProfileMenu from "../../components/profile/ProfileMenu";
import ProfileAvatar from "../../components/profile/ProfileAvatar";
import PaymentHistory from "../../components/payment/PaymentHistory";

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  // Fetch full user details with equipped cosmetics
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      username: true,
      rank: true,
      totalExp: true,
      totalWins: true,
      winStreak: true,
      longestStreak: true,
      createdAt: true,
      activeBannerId: true,
      activeCoatFrame: true,
      activeNameEffect: true,
      activeTitle: true,
      avatarUrl: true,
      hiddenVaultItems: true,
      cosmetics: {
        include: { cosmetic: true }
      },
      wonAuctions: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch equipped cosmetics objects
  const banner = user.activeBannerId ? await prisma.cosmetic.findUnique({ where: { id: user.activeBannerId } }) : null;
  const frame = user.activeCoatFrame ? await prisma.cosmetic.findUnique({ where: { id: user.activeCoatFrame } }) : null;
  const nameEffect = user.activeNameEffect ? await prisma.cosmetic.findUnique({ where: { id: user.activeNameEffect } }) : null;

  // Determine styles from cosmetics
  const hasCustomBanner = banner?.imageUrl;
  const bannerBgStyle = hasCustomBanner ? `url(${banner.imageUrl})` : "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(13,59,46,0.8) 100%)";
  
  const frameBorder = "rgba(201, 168, 76, 0.5)"; // Frames styled via CSS class now

  const expLevel = Math.floor(user.totalExp / 1000) + 1;
  const currentExp = user.totalExp % 1000;
  const expPercentage = (currentExp / 1000) * 100;

  // Parse hidden items
  let hiddenItems = { cosmetics: [] as string[], auctions: [] as string[] };
  if (user.hiddenVaultItems && typeof user.hiddenVaultItems === "object" && !Array.isArray(user.hiddenVaultItems)) {
    hiddenItems = user.hiddenVaultItems as any;
  }
  if (!hiddenItems.cosmetics) hiddenItems.cosmetics = [];
  if (!hiddenItems.auctions) hiddenItems.auctions = [];

  // Filter cosmetics and auctions
  const visibleCosmetics = user.cosmetics
    .map(uc => uc.cosmetic)
    .filter(c => !hiddenItems.cosmetics.includes(c.id));
    
  const visibleAuctions = user.wonAuctions
    .filter(a => !hiddenItems.auctions.includes(a.id));

  // Combine to visible vault items
  const vaultItems = [
    ...visibleAuctions.map(a => ({
      id: a.id,
      name: a.title,
      rarity: a.rarity,
      date: a.endTime ? a.endTime.toISOString().split("T")[0] : "Unknown"
    })),
    ...visibleCosmetics.map(c => ({
      id: c.id,
      name: c.name,
      rarity: c.rarity,
      date: "Owned" // user_cosmetics might not have createdAt mapped yet
    }))
  ].slice(0, 4); // Just show top 4 on profile as a preview

  return (
    <div style={{
      padding: "2rem",
      paddingBottom: "5rem",
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1400px",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}>
        
        {/* ========================================================= */}
        {/* HORIZONTAL IDENTITY CARD (TOP BANNER) */}
        {/* ========================================================= */}
        <div style={{
          position: "relative",
          width: "100%",
          background: bannerBgStyle,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "20px",
          border: "1px solid rgba(201,168,76,0.3)",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "stretch", // Ensures children stretch to full height
          minHeight: "280px" // Provide a minimum height for the card
        }}>
          {!hasCustomBanner && (
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <ImperialNameCardBg />
            </div>
          )}
          {/* Gradient Overlay moving left-to-right to blend the background */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(5,5,8,0.9) 0%, rgba(5,5,8,0.7) 40%, transparent 100%)", zIndex: 1 }} />
          
          {/* Settings Menu */}
          <ProfileMenu />

          {/* Card Content (Horizontal Layout) */}
          <div style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "2.5rem 3rem",
            gap: "3rem",
            width: "100%",
          }}>
            {/* 1. Left: Avatar */}
            <ProfileAvatar 
              avatarUrl={user.avatarUrl} 
              frameWebCode={frame?.webCode || ""} 
              splineUrl={frame?.splineUrl || ""}
              isOwner={true} 
              userId={user.username}
            />

            {/* 2. Middle: Identity & Bio */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <h1 style={{
                  fontFamily: "var(--font-cinzel, serif)",
                  fontSize: "3rem",
                  margin: 0,
                  color: "#fff",
                  textShadow: "0 4px 8px rgba(0,0,0,0.8)",
                  letterSpacing: "0.05em",
                  lineHeight: "1.2"
                }}>
                  {user.username}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    padding: "6px 16px",
                    borderRadius: "20px",
                  }}>
                    <ShieldEmblem size={20} />
                    <span style={{ color: "#c9a84c", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                      {user.rank}
                    </span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic", fontSize: "1.1rem" }}>
                    &quot;{user.activeTitle || "The Unseen Wanderer"}&quot;
                  </div>
                </div>
              </div>

              <p style={{ 
                fontSize: "1rem", 
                color: "rgba(255,255,255,0.7)", 
                lineHeight: "1.6", 
                maxWidth: "600px",
                margin: 0,
                borderLeft: "2px solid rgba(201,168,76,0.3)",
                paddingLeft: "1rem"
              }}>
                Berdiri di bawah panji Emerald Kingdom. Saya adalah pendatang baru yang akan menaklukkan panggung Grand Auction dan mengumpulkan Crown Coins sebanyak-banyaknya.
              </p>
            </div>

            {/* 3. Right: EXP Bar & Badges */}
            <div style={{
              width: "350px",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "15px",
              padding: "1.5rem",
              flexShrink: 0
            }}>
              {/* EXP Progress */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "flex-end" }}>
                  <div style={{ fontSize: "0.9rem", color: "#f5f5f0", fontFamily: "var(--font-cinzel, serif)", fontWeight: 700 }}>
                    Level {expLevel}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#f59e0b", fontFamily: "var(--font-orbitron, monospace)", fontWeight: 700 }}>
                    {currentExp} / 1000 XP
                  </div>
                </div>
                <div style={{ width: "100%", height: "10px", background: "rgba(0,0,0,0.8)", borderRadius: "5px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)" }}>
                  <div style={{ 
                    width: `${expPercentage}%`, 
                    height: "100%", 
                    background: "linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #fde68a 100%)",
                    boxShadow: "0 0 10px rgba(245, 158, 11, 0.6)",
                    transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} />
                </div>
              </div>

              {/* Badges */}
              <div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>
                  Earned Badges
                </div>
                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <div title="First Blood" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImperialEagle size={20} />
                  </div>
                  <div title="Collector" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldEmblem size={20} />
                  </div>
                  <div title="Fierce Competitor" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CrossedSwords size={20} />
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Age</span>
                <span style={{ color: "#e2e8f0", fontSize: "0.9rem", fontWeight: 600 }}>
                  {Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Days
                </span>
              </div>
            </div>

          </div>
        </div>


        {/* ========================================================= */}
        {/* LOWER GRID: STATS & VAULT */}
        {/* ========================================================= */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem", alignItems: "start" }}>
          
          {/* PERFORMANCE STATS (Vertical Left Sidebar) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0.5) 100%)", padding: "1.5rem", borderRadius: "15px", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "rgba(16,185,129,0.1)", padding: "1rem", borderRadius: "10px" }}><ImperialEagle size={30} /></div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Auction Wins</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#10b981", fontFamily: "var(--font-orbitron, monospace)" }}>{user.totalWins}</div>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.05) 0%, rgba(0,0,0,0.5) 100%)", padding: "1.5rem", borderRadius: "15px", border: "1px solid rgba(244,63,94,0.2)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "rgba(244,63,94,0.1)", padding: "1rem", borderRadius: "10px" }}><CrossedSwords size={30} /></div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Streak</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f43f5e", fontFamily: "var(--font-orbitron, monospace)" }}>{user.winStreak}</div>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(0,0,0,0.5) 100%)", padding: "1.5rem", borderRadius: "15px", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "rgba(201,168,76,0.1)", padding: "1rem", borderRadius: "10px" }}><ShieldEmblem size={30} /></div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Longest Streak</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#c9a84c", fontFamily: "var(--font-orbitron, monospace)" }}>{user.longestStreak}</div>
              </div>
            </div>
          </div>

          {/* THE VAULT (Collection on the right) */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "1.8rem", margin: 0, color: "#f5f5f0", letterSpacing: "0.05em" }}>The Imperial Vault</h2>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Items Won in Auctions</span>
            </div>
            
            {vaultItems.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
                {vaultItems.map((item) => (
                  <div key={item.id} style={{ 
                    background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.5) 100%)", 
                    border: "1px solid rgba(255,255,255,0.05)", 
                    borderRadius: "15px", 
                    padding: "1.5rem",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    {/* Glow effect based on rarity */}
                    <div style={{ 
                      position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", 
                      width: "100px", height: "50px", 
                      background: item.rarity === "LEGENDARY" ? "#f59e0b" : item.rarity === "EPIC" ? "#a855f7" : "#3b82f6", 
                      filter: "blur(30px)", opacity: 0.3 
                    }} />
                    
                    <div style={{ 
                      width: "100px", height: "100px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", 
                      borderRadius: "15px", margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.5)"
                    }}>
                      <span style={{ fontSize: "2.5rem" }}>✨</span> {/* Placeholder for actual item image */}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>{item.rarity}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>{item.name}</div>
                  </div>
                ))}
              </div>
            ) : (
               <div style={{ textAlign: "center", padding: "5rem 2rem", background: "rgba(0,0,0,0.3)", borderRadius: "15px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                <div style={{ color: "rgba(255,255,255,0.2)", marginBottom: "1.5rem" }}><ImperialEagle size={64} /></div>
                <h3 style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.3rem", fontWeight: 400, marginBottom: "0.5rem" }}>Your Vault is Empty</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto" }}>
                  Participate and win items in the Grand Auction to display them in your Imperial Vault.
                </p>
                <Link href="/live-auction" style={{ display: "inline-block", marginTop: "2rem", padding: "1rem 2.5rem", background: "linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 100%)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.4)", borderRadius: "8px", textDecoration: "none", fontWeight: 600, transition: "all 0.3s" }}>
                  Enter Grand Auction
                </Link>
              </div>
            )}
          </div>
          
        </div>

        {/* ========================================================= */}
        {/* PAYMENT HISTORY SECTION */}
        {/* ========================================================= */}
        <div 
          id="payment-history"
          style={{ 
            background: "rgba(255,255,255,0.02)", 
            border: "1px solid rgba(255,255,255,0.05)", 
            borderRadius: "20px", 
            padding: "2rem",
            scrollMarginTop: "2rem"
          }}
        >
          <PaymentHistory />
        </div>

      </div>
    </div>
  );
}
