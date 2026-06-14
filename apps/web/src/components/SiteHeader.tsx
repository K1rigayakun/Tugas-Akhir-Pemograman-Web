"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { logoutAction } from "../app/actions/session";
import WalletBalance from "./navigation/WalletBalance";
import ProfileDropdown from "./navigation/ProfileDropdown";
import { SessionUser } from "@/types/navigation";

const links = [
  ["/auction", "Auctions"],
  ["/leaderboard", "Rankings"],
  ["/museum", "Museum"],
  ["/achievements", "Triumphs"],
  ["/events", "Events"],
  ["/shop", "Market"],
  ["/notifications", "Scrolls"],
  ["/help", "Help"],
];

const auctionLinks = [
  ["/auction", "Semua Lelang"],
  ["/auction/live", "Lelang Live"],
  ["/auction/exclusive", "Lelang Eksklusif"],
  ["/auction/event", "Lelang Event"],
];

/** Rank badge color mapping */
const rankColors: Record<string, string> = {
  CIVIS: "#9ca3af",
  KNIGHT: "#22c55e",
  BARON: "#3b82f6",
  EARL: "#8b5cf6",
  MARQUIS: "#f59e0b",
  DUKE: "#ef4444",
  EMPEROR: "#ffd700",
};

interface SiteHeaderProps {
  user?: {
    id: string;
    username: string;
    email: string;
    rank: string;
    avatarUrl?: string;
    totalExp?: number;
    activeCoatFrame?: string | null;
    activeNameEffect?: string | null;
    activeWalletSkin?: string | null;
    walletBalance?: number;
  } | null;
  walletBalance?: number;
}

export default function SiteHeader({ user, walletBalance = 0 }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Map user to SessionUser type for ProfileDropdown
  const sessionUser: SessionUser | null = user ? {
    id: user.id,
    username: user.username,
    email: user.email,
    rank: user.rank,
    xp: user.totalExp || 0,
    walletBalance: user.walletBalance || walletBalance,
    avatarUrl: user.avatarUrl,
    activeCoatFrame: user.activeCoatFrame,
    activeNameEffect: user.activeNameEffect,
    activeWalletSkin: user.activeWalletSkin,
  } : null;

  return (
    <header className="site-header">
      <Link href="/" className="brand-mark">Emerald Kingdom</Link>
      <nav className="site-nav" aria-label="Main navigation">
        {links.map(([href, label]) => {
          if (href === "/auction") {
            return (
              <div key={href} className="nav-dropdown">
                <Link href={href} className={pathname.startsWith(href) ? "active nav-dropdown-trigger" : "nav-dropdown-trigger"}>
                  {label}
                  <span aria-hidden="true">⌄</span>
                </Link>
                <div className="nav-dropdown-menu">
                  {auctionLinks.map(([subHref, subLabel]) => (
                    <Link key={subHref} href={subHref} className={pathname === subHref ? "active" : ""}>
                      {subLabel}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link key={href} href={href} className={pathname.startsWith(href) ? "active" : ""}>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="site-actions" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <form onSubmit={handleSearch} style={{ display: "flex" }}>
          <input 
            type="text" 
            placeholder="Cari lelang..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "4px 0 0 4px",
              border: "1px solid var(--color-border)",
              background: "rgba(10,12,14,0.6)",
              color: "var(--color-ivory)",
              outline: "none"
            }}
          />
          <button type="submit" style={{
            padding: "0.4rem 0.8rem",
            background: "var(--color-emerald)",
            color: "#000",
            border: "none",
            borderRadius: "0 4px 4px 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            Cari
          </button>
        </form>

        {user && sessionUser ? (
          /* ── Sudah Login ── */
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
            
            {/* Wallet Balance */}
            <WalletBalance 
              balance={walletBalance} 
              rank={user.rank} 
            />
            
            {/* Notification Bell */}
            <Link href="/notifications" style={{ position: "relative", color: "var(--color-ivory)", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {/* Dummy unread indicator, we can hook it up with real count later or via socket */}
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "var(--color-danger)", borderRadius: "50%", border: "2px solid #000" }}></span>
            </Link>

            {/* Profile Trigger Button */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              onKeyDown={(e) => {
                // Task 12.2: Enter/Space opens dropdown
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowDropdown(!showDropdown);
                }
              }}
              aria-haspopup="menu"
              aria-expanded={showDropdown}
              aria-label="Buka menu profil"
              // Task 12.3: Visible focus indicator
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "8px",
                padding: "0.35rem 0.75rem",
                cursor: "pointer",
                color: "var(--color-ivory)",
                transition: "all 0.2s",
              }}
              className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-emerald)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.2)"}
            >
              {/* Avatar mini */}
              <div className={user.activeCoatFrame ? "profile-frame-container" : ""} style={{ flexShrink: 0, display: "flex" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${rankColors[user.rank] || "#22c55e"}, rgba(0,0,0,0.3))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#fff",
                }}>
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    (user.username || user.email || '?').charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                <div className={user.activeNameEffect ? "profile-name" : ""} style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {user.username || user.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ fontSize: "0.6rem", color: rankColors[user.rank] || "var(--color-emerald)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {user.rank}
                </div>
              </div>
              {/* Chevron */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown 
              user={sessionUser}
              isOpen={showDropdown}
              onClose={() => setShowDropdown(false)}
            />
          </div>
        ) : (
          /* ── Belum Login ── */
          <>
            <Link href="/login">Login</Link>
            <Link href="/register" className="gold-action">Join</Link>
          </>
        )}
      </div>
    </header>
  );
}
