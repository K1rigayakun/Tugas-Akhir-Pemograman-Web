import { redirect } from "next/navigation";
import { prisma } from "@emerald-kingdom/db";
import { getSessionUser } from "../../actions/session";
import { ProfilePrivacyMode, resolvePrivacyPreferences } from "../../../lib/userPreferences";
import PrivacySettingsClient from "./PrivacySettingsClient";

export const dynamic = "force-dynamic";

export default async function PrivacySettingsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      privacyMode: true,
      notificationPrefs: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <PrivacySettingsClient
      initialPrivacyMode={user.privacyMode as ProfilePrivacyMode}
      initialPreferences={resolvePrivacyPreferences(user.notificationPrefs)}
    />
  );
}
