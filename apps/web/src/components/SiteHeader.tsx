"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark">Emerald Kingdom</Link>
      <nav className="site-nav" aria-label="Main navigation">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={pathname.startsWith(href) ? "active" : ""}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="site-actions">
        <Link href="/login">Login</Link>
        <Link href="/register" className="gold-action">Join</Link>
      </div>
    </header>
  );
}
