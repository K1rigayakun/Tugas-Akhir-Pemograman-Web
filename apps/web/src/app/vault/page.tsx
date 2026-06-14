import { redirect } from "next/navigation";
import { getSessionUser } from "../actions/session";
import { prisma } from "@emerald-kingdom/db";
import VaultClient from "../../components/vault/VaultClient";

export default async function VaultPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  // Fetch user data with cosmetics, won auctions, and hidden preferences
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      username: true,
      rank: true,
      activeBannerId: true,
      activeCoatFrame: true,
      activeNameEffect: true,
      activeWalletSkin: true,
      activeWebCodeId: true,
      hiddenVaultItems: true,
      cosmetics: {
        include: { cosmetic: true }
      },
      wonAuctions: true
    },
  });

  if (!user) {
    redirect("/login");
  }

  let myCosmetics = user.cosmetics.map(uc => uc.cosmetic);
  let myAuctions = user.wonAuctions;

  // Emperor perk: has access to all cosmetics
  if (user.rank === "EMPEROR") {
    myCosmetics = await prisma.cosmetic.findMany();
  }

  // Parse hidden items
  let hiddenItems = { cosmetics: [] as string[], auctions: [] as string[] };
  if (user.hiddenVaultItems && typeof user.hiddenVaultItems === "object" && !Array.isArray(user.hiddenVaultItems)) {
    hiddenItems = user.hiddenVaultItems as any;
  }
  if (!hiddenItems.cosmetics) hiddenItems.cosmetics = [];
  if (!hiddenItems.auctions) hiddenItems.auctions = [];

  const activeCosmetics = {
    FRAME: user.activeCoatFrame,
    BANNER: user.activeBannerId,
    NAME_EFFECT: user.activeNameEffect,
    WALLET_SKIN: user.activeWalletSkin,
    WEB_CODE: user.activeWebCodeId
  };

  return (
    <div style={{
      padding: "2rem",
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <VaultClient 
          cosmetics={myCosmetics} 
          auctions={myAuctions} 
          hiddenItems={hiddenItems}
          activeCosmetics={activeCosmetics}
        />
      </div>
    </div>
  );
}
