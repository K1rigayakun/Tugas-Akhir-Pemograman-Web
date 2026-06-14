import { redirect } from "next/navigation";

/**
 * Settings Root - Redirect to Account Settings
 */
export default function SettingsPage() {
  redirect("/settings/account");
}
