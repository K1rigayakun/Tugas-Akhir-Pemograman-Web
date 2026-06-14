"use client";

import React, { useState, useRef, useTransition, Suspense } from "react";
import Spline from '@splinetool/react-spline';
import { Camera, Loader2 } from "lucide-react";
import { AvatarSilhouette } from "../LuxurySVGs";
import { API_URL } from "../../lib/api";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  frameWebCode?: string;
  splineUrl?: string;
  isOwner: boolean;
  userId: string;
}

export default function ProfileAvatar({ avatarUrl, frameWebCode, splineUrl, isOwner, userId }: ProfileAvatarProps) {
  const scopeId = `avatar-frame-${userId}`;
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(avatarUrl || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalAvatar(objectUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/upload/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}` // Fallback, mostly relying on cookies
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      const data = await response.json();
      if (data.url) {
        // Save to user profile
        const saveRes = await fetch(`${API_URL}/auth/me/change-avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
          body: JSON.stringify({ avatarUrl: data.url })
        });
        
        if (!saveRes.ok) throw new Error("Failed to save avatar to profile");
        
        setLocalAvatar(data.url);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengupload foto profil.");
      setLocalAvatar(avatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className={scopeId}
      style={{
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        background: "#050508",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        cursor: isOwner ? "pointer" : "default"
      }}
      onMouseEnter={() => isOwner && setIsHovering(true)}
      onMouseLeave={() => isOwner && setIsHovering(false)}
      onClick={() => isOwner && fileInputRef.current?.click()}
    >
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
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {localAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={localAvatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", bottom: -15, width: "100%", display: "flex", justifyContent: "center" }}><AvatarSilhouette size={170} /></div>
        )}
      </div>

      {/* Hover Overlay */}
      {isOwner && isHovering && !isUploading && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <Camera size={32} style={{ marginBottom: "0.5rem" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>UBAH FOTO</span>
        </div>
      )}

      {isUploading && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}

      {isOwner && (
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          accept="image/*" 
          onChange={handleUpload} 
        />
      )}
    </div>
  );
}
