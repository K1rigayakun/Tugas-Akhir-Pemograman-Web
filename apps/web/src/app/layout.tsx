// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import LenisProvider from "./LenisProvider";
import BackgroundCanvas from "../components/BackgroundCanvas";
import CosmeticsInjector from "../components/CosmeticsInjector";
import DisplayPreferenceInjector from "../components/DisplayPreferenceInjector";
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";
import { getSessionUser } from "./actions/session";
import { getActiveEventAction } from "./actions/events";
import RankThemeInjector from "../components/RankThemeInjector";
import EmperorAscension from "../components/EmperorAscension";
import ThemeInjector from "../components/ThemeInjector";
import { prisma } from "@emerald-kingdom/db";
import { resolveDisplayPreferences } from "../lib/userPreferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emerald Kingdom — Where Fortune Meets Glory",
  description:
    "Platform lelang online premium bertema kerajaan medieval fantasy. Bid. Conquer. Ascend.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const activeEvent = await getActiveEventAction();
  const userPreferences = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { notificationPrefs: true, activeWebCodeId: true },
      })
    : null;
  const displayPreferences = userPreferences
    ? resolveDisplayPreferences(userPreferences.notificationPrefs, userPreferences.activeWebCodeId)
    : null;

  // Extract wallet balance from user session
  const walletBalance = user?.walletBalance || 0;

  // Parse event accent colors (assuming it's an array of hex colors like ["#00bfff", "#1e90ff"])
  let eventAccentColor = "";
  const colors = activeEvent?.accentColors as any[];
  if (colors && Array.isArray(colors) && colors.length > 0) {
    eventAccentColor = String(colors[0]);
  }

  // Load active web code string from Cosmetic database
  let activeWebCodeStr = null;
  if (userPreferences?.activeWebCodeId) {
    const cosmetic = await prisma.cosmetic.findUnique({
      where: { id: userPreferences.activeWebCodeId }
    });
    if (cosmetic && cosmetic.webCode) {
      activeWebCodeStr = cosmetic.webCode;
    }
  }

  // Load Platform Theme
  let platformTheme = { baseTheme: "carbon-hexagon", effectLayer: "emerald-particles" };
  try {
    const platformSetting = await prisma.platformSetting.findUnique({
      where: { key: "theme" }
    });
    if (platformSetting && platformSetting.value) {
      platformTheme = platformSetting.value as any;
    }
  } catch (e) {
    // Abaikan jika tabel belum siap (fallback)
  }

  return (
    <html lang="id">
      <body className="bg-platform min-h-screen">
        <RankThemeInjector rank={user?.rank} />
        <ThemeInjector activeWebCode={activeWebCodeStr} platformTheme={platformTheme} />
        {activeEvent && eventAccentColor && (
          <style>{`
            :root {
              --color-event-accent: ${eventAccentColor};
            }
          `}</style>
        )}
        {/* Layer 0 — Background canvas, posisi fixed di belakang semua konten */}
        <DisplayPreferenceInjector preferences={displayPreferences} />
        <CosmeticsInjector />
        <BackgroundCanvas />

        {/* Layer 1 — Konten halaman, harus di atas canvas */}
        <LenisProvider>
          <div style={{ position: "relative", zIndex: 1 }}>
            <EmperorAscension />
            <SiteHeader user={user} walletBalance={walletBalance} />
            {children}
            <Footer />
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
