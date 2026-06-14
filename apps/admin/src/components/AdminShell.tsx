"use client";

import { useState } from "react";
import { Sidebar, SidebarContext } from "./Sidebar";

/**
 * AdminShell — Client component yang menyediakan SidebarContext
 * untuk komunikasi collapsed state antara Sidebar dan main content area.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div
          style={{
            marginLeft: `${sidebarWidth}px`,
            flex: 1,
            width: `calc(100% - ${sidebarWidth}px)`,
            transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
