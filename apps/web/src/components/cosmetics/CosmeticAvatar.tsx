"use client";

import React, { Suspense } from "react";
import Spline from '@splinetool/react-spline';

interface CosmeticAvatarProps {
  userId: string;
  src: string;
  alt?: string;
  size?: number;
  frameWebCode?: string;
  splineUrl?: string;
}

export default function CosmeticAvatar({ userId, src, alt = "Avatar", size = 64, frameWebCode, splineUrl }: CosmeticAvatarProps) {
  const scopeId = `avatar-frame-${userId}`;

  return (
    <div className={scopeId} style={{ position: "relative", width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {frameWebCode && (
        <style dangerouslySetInnerHTML={{
          __html: frameWebCode.replace(/%SCOPE%/g, `.${scopeId}`)
        }} />
      )}
      
      {splineUrl && (
        <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", pointerEvents: "none", zIndex: 10 }}>
          <Suspense fallback={null}>
            <Spline scene={splineUrl} />
          </Suspense>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={src} 
        alt={alt} 
        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", position: "relative", zIndex: 1 }} 
      />
    </div>
  );
}
