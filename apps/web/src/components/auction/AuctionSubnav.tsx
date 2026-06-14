"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/auction", label: "Semua" },
  { href: "/auction/live", label: "Live" },
  { href: "/auction/exclusive", label: "Eksklusif" },
  { href: "/auction/event", label: "Event" },
];

export default function AuctionSubnav() {
  const pathname = usePathname();

  return (
    <nav className="auction-subnav" aria-label="Kategori lelang">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} className={active ? "active" : ""}>
            {link.label}
          </Link>
        );
      })}
      <style jsx>{`
        .auction-subnav {
          display: flex;
          gap: 8px;
          margin: 0 auto 28px;
          max-width: 1120px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .auction-subnav a {
          flex: 0 0 auto;
          min-height: 36px;
          padding: 9px 16px;
          border: 1px solid rgba(201, 168, 76, 0.18);
          border-radius: 999px;
          color: rgba(245, 240, 232, 0.62);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
        .auction-subnav a.active {
          border-color: rgba(201, 168, 76, 0.58);
          background: rgba(201, 168, 76, 0.14);
          color: var(--color-gold-light);
        }
      `}</style>
    </nav>
  );
}
