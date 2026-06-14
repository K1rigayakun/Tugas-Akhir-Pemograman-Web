"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, User, Shield, Package, Palette, Receipt } from "lucide-react";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", zIndex: 100 }}>
      {/* Three Dots Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#c9a84c",
          transition: "all 0.3s",
          boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
          cursor: "pointer"
        }}
      >
        <MoreHorizontal size={26} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "55px",
          right: "0",
          width: "220px",
          background: "rgba(10, 15, 18, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .profile-menu-link {
              display: flex;
              alignItems: center;
              gap: 12px;
              padding: 12px 16px;
              color: rgba(255,255,255,0.8);
              text-decoration: none;
              font-size: 0.9rem;
              transition: all 0.2s;
              border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .profile-menu-link:hover {
              background: rgba(201,168,76,0.15);
              color: #c9a84c;
            }
            .profile-menu-link:last-child {
              border-bottom: none;
            }
          `}} />

          <Link href="/settings#account" className="profile-menu-link" onClick={() => setIsOpen(false)}>
            <User size={18} /> Ganti Nama & Bio
          </Link>
          <Link href="/vault" className="profile-menu-link" onClick={() => setIsOpen(false)}>
            <Palette size={18} /> Pilih Kosmetik / Card
          </Link>
          <Link href="/settings#privacy" className="profile-menu-link" onClick={() => setIsOpen(false)}>
            <Shield size={18} /> Pengaturan Privasi
          </Link>
          <Link href="/vault" className="profile-menu-link" onClick={() => setIsOpen(false)}>
            <Package size={18} /> My Vault (Inventory)
          </Link>
          <Link href="/profile#payment-history" className="profile-menu-link" onClick={() => setIsOpen(false)}>
            <Receipt size={18} /> Riwayat Pembayaran
          </Link>
        </div>
      )}
    </div>
  );
}
