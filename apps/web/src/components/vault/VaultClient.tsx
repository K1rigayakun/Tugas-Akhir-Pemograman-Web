"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Star, Palette, Eye, EyeOff, ShieldCheck, Box } from "lucide-react";
import { toggleVaultItemVisibilityAction, equipCosmeticAction } from "../../app/actions/vault";

type VaultItem = {
  id: string;
  name: string;
  type: string; // "FRAME", "BANNER", "AUCTION", etc.
  rarity: string;
  imageUrl?: string;
  description?: string;
  obtainMethod?: string;
  isAuction?: boolean;
};

interface VaultClientProps {
  cosmetics: any[];
  auctions: any[];
  hiddenItems: { cosmetics: string[]; auctions: string[] };
  activeCosmetics: Record<string, string | null>;
}

export default function VaultClient({ cosmetics, auctions, hiddenItems, activeCosmetics }: VaultClientProps) {
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  const allItemsRaw: VaultItem[] = [
    ...auctions.map(a => ({
      id: a.id,
      name: a.title,
      type: "AUCTION",
      rarity: a.rarity,
      imageUrl: a.imageUrl,
      description: a.description,
      obtainMethod: "Menang Lelang",
      isAuction: true
    })),
    ...cosmetics.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      rarity: c.rarity,
      imageUrl: c.imageUrl || c.webCode,
      description: c.description,
      obtainMethod: c.obtainMethod,
      isAuction: false
    }))
  ];

  const allItems = selectedCategory === "ALL" 
    ? allItemsRaw 
    : allItemsRaw.filter(item => item.type === selectedCategory);

  const categories = [
    { id: "ALL", label: "Semua" },
    { id: "WEB_CODE", label: "Web Theme" },
    { id: "FRAME", label: "Avatar Frame" },
    { id: "NAME_EFFECT", label: "Name Effect" },
    { id: "WALLET_SKIN", label: "Wallet Skin" },
    { id: "BANNER", label: "Banner" },
    { id: "AUCTION", label: "Item Lelang" }
  ];

  const getRarityColor = (r: string) => {
    const map: Record<string, string> = { COMMON: "#9ca3af", UNCOMMON: "#22c55e", RARE: "#3b82f6", EPIC: "#8b5cf6", LEGENDARY: "#f59e0b", MYTHIC: "#ef4444" };
    return map[r] || "#9ca3af";
  };

  const getTypeName = (t: string) => {
    const map: Record<string, string> = {
      WEB_CODE: "Tema Website",
      FRAME: "Bingkai Avatar",
      NAME_EFFECT: "Efek Nama",
      WALLET_SKIN: "Skin Dompet",
      BANNER: "Banner Profil",
      AUCTION: "Item Lelang"
    };
    return map[t] || t;
  };

  const handleToggleVisibility = () => {
    if (!selectedItem) return;
    const isHidden = selectedItem.isAuction ? hiddenItems.auctions.includes(selectedItem.id) : hiddenItems.cosmetics.includes(selectedItem.id);
    const itemType = selectedItem.isAuction ? "auction" : "cosmetic";
    
    startTransition(async () => {
      await toggleVaultItemVisibilityAction(selectedItem.id, itemType, !isHidden);
    });
  };

  const handleEquip = () => {
    if (!selectedItem || selectedItem.isAuction) return;
    const isEquipped = activeCosmetics[selectedItem.type] === selectedItem.id;
    startTransition(async () => {
      await equipCosmeticAction(isEquipped ? null : selectedItem.id, selectedItem.type as any);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: "1.5rem" }}>
        <div>
          <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: "1rem", fontSize: "0.9rem", transition: "color 0.2s" }}>
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "2.5rem", margin: 0, color: "#f5f5f0", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Package size={36} color="#c9a84c" /> Imperial Vault
          </h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>Koleksi eksklusif, relik, dan kosmetik yang kamu miliki.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem", alignItems: "start" }}>
        
        {/* LEFT COLUMN: GRID & TABS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* CATEGORY TABS */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "0.5rem 1rem",
                  background: selectedCategory === cat.id ? "rgba(201,168,76,0.2)" : "transparent",
                  color: selectedCategory === cat.id ? "#c9a84c" : "rgba(255,255,255,0.5)",
                  border: selectedCategory === cat.id ? "1px solid rgba(201,168,76,0.5)" : "1px solid transparent",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {allItems.length === 0 && (
              <div style={{ padding: "3rem", textAlign: "center", background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)", gridColumn: "1 / -1" }}>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>Tidak ada item di kategori ini.</p>
              </div>
            )}
            {allItems.map(item => {
              const isHidden = item.isAuction ? hiddenItems.auctions.includes(item.id) : hiddenItems.cosmetics.includes(item.id);
              const isEquipped = activeCosmetics[item.type] === item.id;
              const isSelected = selectedItem?.id === item.id;
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.4)",
                    border: isSelected ? `1px solid ${getRarityColor(item.rarity)}` : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "1rem",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s",
                    boxShadow: isSelected ? `0 0 15px ${getRarityColor(item.rarity)}40` : "none"
                  }}
                >
                  <div style={{ width: "100%", height: "120px", background: "rgba(0,0,0,0.5)", borderRadius: "8px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {item.imageUrl && !item.imageUrl.includes("{") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isHidden ? 0.3 : 1 }} />
                    ) : (
                      <Box size={40} color={getRarityColor(item.rarity)} style={{ opacity: isHidden ? 0.3 : 1 }} />
                    )}
                  </div>
                  
                  {isHidden && (
                    <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(0,0,0,0.8)", padding: "0.3rem", borderRadius: "50%", color: "#ef4444" }}>
                      <EyeOff size={16} />
                    </div>
                  )}

                  {isEquipped && (
                    <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#10b981", color: "#000", fontSize: "0.6rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "10px", border: "1px solid #fff", zIndex: 2 }}>
                      EQUIPPED
                    </div>
                  )}

                  <div style={{ color: getRarityColor(item.rarity), fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.2rem", textTransform: "uppercase", fontWeight: 700 }}>
                    {item.rarity} {getTypeName(item.type)}
                  </div>
                  <h3 style={{ fontSize: "0.95rem", margin: 0, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL PANEL */}
        <div>
          {selectedItem ? (
            <div style={{
              position: "sticky",
              top: "8rem",
              background: "linear-gradient(180deg, rgba(201,168,76,0.1) 0%, rgba(0,0,0,0.8) 100%)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "16px",
              padding: "2rem",
              animation: "slideIn 0.3s ease-out",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8)"
            }}>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideIn {
                  from { opacity: 0; transform: translateX(20px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                .vault-switch {
                  position: relative; width: 40px; height: 22px; background: rgba(255,255,255,0.2); border-radius: 11px; cursor: pointer; transition: all 0.3s;
                }
                .vault-switch.active { background: #10b981; }
                .vault-switch-knob {
                  position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: all 0.3s;
                }
                .vault-switch.active .vault-switch-knob { transform: translateX(18px); }
              `}} />
              
              <div style={{ width: "100%", height: "200px", background: "rgba(0,0,0,0.5)", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: `1px solid ${getRarityColor(selectedItem.rarity)}` }}>
                {selectedItem.imageUrl && !selectedItem.imageUrl.includes("{") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedItem.imageUrl} alt={selectedItem.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Box size={60} color={getRarityColor(selectedItem.rarity)} />
                )}
              </div>

              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ color: getRarityColor(selectedItem.rarity), fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {selectedItem.rarity} {getTypeName(selectedItem.type)}
                </div>
                <h2 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "1.5rem", color: "#f5f5f0", margin: "0 0 1rem 0" }}>
                  {selectedItem.name}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                  {selectedItem.description || "Sebuah item langka dari Emerald Kingdom."}
                </p>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Cara Perolehan</div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ShieldCheck size={16} color="var(--color-gold)" /> {selectedItem.obtainMethod || "Unknown"}
                </div>
              </div>

              {/* ACTION: EQUIP */}
              {!selectedItem.isAuction && (
                <button 
                  onClick={handleEquip}
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    background: activeCosmetics[selectedItem.type] === selectedItem.id ? "rgba(239, 68, 68, 0.1)" : "var(--color-gold)",
                    color: activeCosmetics[selectedItem.type] === selectedItem.id ? "#ef4444" : "#000",
                    border: activeCosmetics[selectedItem.type] === selectedItem.id ? "1px solid #ef4444" : "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginBottom: "1rem",
                    transition: "all 0.2s",
                    opacity: isPending ? 0.7 : 1
                  }}
                >
                  {activeCosmetics[selectedItem.type] === selectedItem.id ? "UNEQUIP" : "EQUIP ITEM"}
                </button>
              )}

              {/* ACTION: PRIVACY TOGGLE */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div>
                  <div style={{ color: "#e2e8f0", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.2rem" }}>Tampilkan di Profil</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Orang lain bisa melihat item ini.</div>
                </div>
                <div 
                  className={`vault-switch ${(selectedItem.isAuction ? hiddenItems.auctions.includes(selectedItem.id) : hiddenItems.cosmetics.includes(selectedItem.id)) ? "" : "active"}`}
                  onClick={handleToggleVisibility}
                  style={{ opacity: isPending ? 0.5 : 1 }}
                >
                  <div className="vault-switch-knob" />
                </div>
              </div>

            </div>
          ) : (
            <div style={{ height: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
              <Package size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
              <p>Pilih item di sebelah kiri untuk melihat detail.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
