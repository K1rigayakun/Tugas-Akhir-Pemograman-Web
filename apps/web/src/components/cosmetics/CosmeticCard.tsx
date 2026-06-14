"use client";

import React from "react";

interface CosmeticCardProps {
  userId: string;
  webCode?: string; // CSS khusus untuk card
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function CosmeticCard({ userId, webCode, children, className = "", style = {} }: CosmeticCardProps) {
  const scopeId = `card-effect-${userId}`;

  return (
    <div className={`${scopeId} ${className}`} style={{ position: "relative", ...style }}>
      {webCode && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .${scopeId} {
              ${webCode}
            }
          `
        }} />
      )}
      {children}
    </div>
  );
}
