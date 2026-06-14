import { redirect } from "next/navigation";
import { getSessionUser } from "../actions/session";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import SettingsSidebar from "@/components/navigation/SettingsSidebar";

/**
 * Settings Layout
 * Shared layout for all settings pages with sidebar navigation
 */
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();

  // Redirect to login if not authenticated
  if (!sessionUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        {/* Settings Grid: Sidebar + Content */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Settings Sidebar */}
          <SettingsSidebar />

          {/* Settings Content Area */}
          <main className="settings-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
