import { prisma } from "@emerald-kingdom/db";
import { getSessionUser } from "../app/actions/session";
import MouseTracker from "./MouseTracker";

export default async function CosmeticsInjector() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  try {
    // 1. Fetch current user to determine if they have a Spline background active
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        activeWebCodeId: true,
        activeCoatFrame: true,
        activeNameEffect: true,
        activeWalletSkin: true,
        activeBannerId: true,
      }
    });

    // 2. Fetch ALL cosmetics that have webCode and are meant to be scoped (NAME_EFFECT, AVATAR_FRAME)
    // This allows seeing other users' cosmetics in live chat / leaderboards without breaking global body themes
    const globalCosmetics = await prisma.cosmetic.findMany({
      where: { 
        webCode: { not: null },
        type: { in: ["NAME_EFFECT", "FRAME", "CHAT_EFFECT"] }
      }
    });

    // 2.5 Fetch CURRENT user's webCode cosmetics (like global themes/banners)
    let userSpecificCosmetics: any[] = [];
    if (dbUser) {
      const activeIds = [
        dbUser.activeWebCodeId,
        dbUser.activeCoatFrame,
        dbUser.activeNameEffect,
        dbUser.activeWalletSkin,
        dbUser.activeBannerId,
      ].filter(Boolean) as string[];
      
      if (activeIds.length > 0) {
        userSpecificCosmetics = await prisma.cosmetic.findMany({
          where: { id: { in: activeIds } }
        });
      }
    }

    // Gabungkan unique
    const allToInject = [...globalCosmetics];
    for (const uc of userSpecificCosmetics) {
      if (!allToInject.find(c => c.id === uc.id)) {
        allToInject.push(uc);
      }
    }

    const styles = allToInject
      .filter(c => c.webCode && c.webCode.trim().length > 0)
      .map(c => `/* Cosmetic: ${c.name} */\n${c.webCode}`)
      .join("\n\n");

    const finalStyles = `
      ${styles}
    `;

    // 3. Find if the CURRENT user has a mythic Spline URL active
    let activeSplineCosmetic = null;
    if (dbUser) {
      const activeIds = [
        dbUser.activeWebCodeId,
        dbUser.activeCoatFrame,
        dbUser.activeNameEffect,
        dbUser.activeWalletSkin,
        dbUser.activeBannerId,
      ].filter(Boolean) as string[];
      
      if (activeIds.length > 0) {
        activeSplineCosmetic = await prisma.cosmetic.findFirst({
          where: { 
            id: { in: activeIds },
            splineUrl: { not: null }
          }
        });
      }
    }

    return (
      <>
        {styles && <style dangerouslySetInnerHTML={{ __html: finalStyles }} />}
        <MouseTracker />
        {activeSplineCosmetic?.splineUrl && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1, // Behind everything except body background
            pointerEvents: 'none',
            opacity: 0.8
          }}>
            <iframe 
              src={activeSplineCosmetic.splineUrl} 
              frameBorder="0" 
              width="100%" 
              height="100%" 
              style={{ pointerEvents: 'auto' }}
            ></iframe>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error("Gagal memuat cosmetics web code:", error);
    return null;
  }
}
