"use client";

import React from "react";

interface CosmeticNameProps {
  userId: string;
  name: string;
  webCode?: string; // CSS Web Code
}

export default function CosmeticName({ userId, name, webCode }: CosmeticNameProps) {
  // Buat ID unik berdasarkan user untuk scope CSS
  const scopeId = `name-effect-${userId}`;

  return (
    <span className={scopeId} style={{ display: "inline-block", position: "relative" }}>
      {/* Inject scoped CSS jika ada */}
      {webCode && (
        <style dangerouslySetInnerHTML={{
          __html: `
            .${scopeId} {
              ${webCode}
            }
          `
        }} />
      )}
      {name}
    </span>
  );
}
