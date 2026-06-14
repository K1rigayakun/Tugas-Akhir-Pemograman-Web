"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BreadcrumbProps } from "@/types/navigation";

/**
 * Route labels mapping (Indonesian)
 */
const routeLabels: Record<string, string> = {
  "": "Beranda",
  "auction": "Lelang",
  "live": "Live",
  "exclusive": "Eksklusif",
  "event": "Event",
  "leaderboard": "Peringkat",
  "museum": "Museum",
  "achievements": "Triumphs",
  "events": "Events",
  "shop": "Market",
  "profile": "Profil",
  "wallet": "Dompet",
  "collection": "Koleksi",
  "vault": "Vault",
  "settings": "Pengaturan",
  "account": "Akun",
  "display": "Tampilan",
  "privacy": "Privasi",
  "notifications": "Notifikasi",
  "help": "Bantuan",
  "topup": "Top Up",
  "admin": "Admin",
  "users": "Pengguna",
  "items": "Item",
  "auctions": "Lelang",
  "deliveries": "Pengiriman",
  "payments": "Pembayaran",
};

/**
 * Breadcrumb Component
 * Displays hierarchical navigation path
 */
export default function Breadcrumb({ className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  const buildBreadcrumbs = () => {
    try {
      const segments = pathname.split("/").filter(Boolean);
      const breadcrumbs = [{ path: "/", label: "Beranda" }];

      let currentPath = "";
      segments.forEach((segment) => {
        currentPath += `/${segment}`;
        // Task 10.3: Handle unknown routes with segment name as fallback
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({ path: currentPath, label });
      });

      return breadcrumbs;
    } catch (error) {
      // Task 10.3: Fall back to current page only if path parsing fails
      console.error("Breadcrumb path parsing error:", error);
      return [
        { path: "/", label: "Beranda" },
        { path: pathname, label: "Current Page" }
      ];
    }
  };

  const breadcrumbs = buildBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  return (
    <nav 
      aria-label="breadcrumb" 
      className={`py-3 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isTruncated = breadcrumbs.length > 3 && index > 0 && index < breadcrumbs.length - 1;

          // On mobile, truncate middle segments
          if (isTruncated && breadcrumbs.length > 3) {
            if (index === 1) {
              return (
                <li key="ellipsis" className="flex items-center gap-2 md:hidden">
                  <span className="text-gray-500">...</span>
                  <span className="text-gray-500/40">›</span>
                </li>
              );
            } else {
              return null;
            }
          }

          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {!isLast ? (
                <>
                  <Link
                    href={crumb.path}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                  <span className="text-gray-500/40 select-none">›</span>
                </>
              ) : (
                <span
                  aria-current="page"
                  className="text-emerald-400 font-semibold"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
