import { redirect } from "next/navigation";
import { prisma } from "@emerald-kingdom/db";
import { getSessionUser } from "../../actions/session";
import { resolveDisplayPreferences } from "../../../lib/userPreferences";
import DisplaySettingsClient from "./DisplaySettingsClient";

export const dynamic = "force-dynamic";

export default async function DisplaySettingsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      rank: true,
      notificationPrefs: true,
      activeWebCodeId: true,
      cosmetics: {
        where: { cosmetic: { type: "WEB_CODE" } },
        select: {
          cosmetic: {
            select: {
              id: true,
              name: true,
              rarity: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const webThemes = user.rank === "EMPEROR"
    ? await prisma.cosmetic.findMany({
        where: { type: "WEB_CODE" },
        select: { id: true, name: true, rarity: true, description: true },
        orderBy: { name: "asc" },
      })
    : user.cosmetics.map((item) => item.cosmetic).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DisplaySettingsClient
      initialPreferences={resolveDisplayPreferences(user.notificationPrefs, user.activeWebCodeId)}
      webThemes={webThemes}
    />
  );
}
