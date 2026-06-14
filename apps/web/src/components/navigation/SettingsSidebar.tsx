"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsSidebarProps } from "@/types/navigation";

/**
 * Settings navigation items
 */
const settingsNav = [
  { 
    path: "/settings/account", 
    label: "Pengaturan Akun",
    icon: "👤"
  },
  { 
    path: "/settings/display", 
    label: "Pengaturan Tampilan",
    icon: "🎨"
  },
  { 
    path: "/settings/privacy", 
    label: "Privasi",
    icon: "🔒"
  },
];

/**
 * SettingsSidebar Component
 * Persistent navigation between settings pages
 */
export default function SettingsSidebar({ currentPath }: SettingsSidebarProps) {
  const pathname = usePathname();
  
  // Task 10.4: Handle edge cases where pathname is malformed
  let activePath: string;
  try {
    activePath = currentPath || pathname || "";
  } catch (error) {
    console.error("Sidebar path matching error:", error);
    activePath = "";
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        aria-label="Navigasi pengaturan"
        className="hidden md:block sticky top-24 bg-gradient-to-b from-white/5 to-black/50 rounded-2xl border border-white/5 p-6 w-72"
      >
        <h2 className="font-cinzel text-amber-400 text-xl mb-6 pb-4 border-b border-amber-400/20">
          Pengaturan
        </h2>

        <div className="flex flex-col gap-2">
          {settingsNav.map((item) => {
            // Task 10.4: Highlight nothing if current path doesn't match any sidebar item
            const isActive = activePath ? activePath === item.path : false;

            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  border-l-4
                  ${isActive 
                    ? "bg-amber-400/10 text-amber-300 font-semibold border-amber-400" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border-transparent"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Tabs */}
      <nav
        aria-label="Navigasi pengaturan"
        className="md:hidden sticky top-16 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-4"
      >
        <div className="flex gap-1 overflow-x-auto">
          {settingsNav.map((item) => {
            // Task 10.4: Highlight nothing if current path doesn't match any sidebar item
            const isActive = activePath ? activePath === item.path : false;

            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-all
                  border-b-2
                  ${isActive 
                    ? "text-amber-400 font-semibold border-amber-400" 
                    : "text-gray-400 hover:text-gray-200 border-transparent"
                  }
                `}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
