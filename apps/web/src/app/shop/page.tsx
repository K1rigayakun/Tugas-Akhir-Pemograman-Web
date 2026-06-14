"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";

import { fetchShopItemsAction, purchaseShopItemAction } from "../actions/shop";
import { checkKycAction } from "../actions/auth";

type ShopItem = {
  id: string;
  name: string;
  type: string;
  price: number;
  flashSalePrice: number | null;
  isLimited: boolean;
  stock: number | null;
  requiredRank: string | null;
  image: string | null;
};

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isKycApproved, setIsKycApproved] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      checkKycAction(),
      fetchShopItemsAction()
    ]).then(([kycStatus, fetchedItems]) => {
      setIsKycApproved(kycStatus === "APPROVED");
      if (fetchedItems && Array.isArray(fetchedItems)) {
        setItems(fetchedItems);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  async function purchase(id: string) {
    if (!isKycApproved) return setMessage("Silakan login dan selesaikan KYC sebelum membeli.");
    
    setMessage("Memproses pembelian...");
    const res = await purchaseShopItemAction(id);
    if (res.success) {
      setMessage("Pembelian berhasil. Item masuk ke koleksi Anda.");
    } else {
      setMessage(res.error || "Pembelian gagal.");
    }
  }
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Royal Market" title="Treasures for Your Identity" description="Gunakan Crown Coin untuk cosmetic, banner, frame, dan item limited edition." />
      {message && <p className="status-message">{message}</p>}
      <AnimatedSection staggerChildren staggerSelector=".shop-card" delay={200}>
        {isLoading ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>Membuka toko kosmetik...</p>
        ) : items.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>Toko sedang kosong.</p>
        ) : (
          <section className="data-grid shop-grid">
            {items.map((item) => (
              <article key={item.id} className="content-card shop-card">
                <span>{item.isLimited ? `Limited${item.stock ? ` - ${item.stock} left` : ""}` : item.type}</span>
                <div className="shop-preview">
                  {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.name.slice(0, 1)}
                </div>
                <h2>{item.name}</h2>
                <p className="metric">{(item.flashSalePrice || item.price).toLocaleString("id-ID")} CC</p>
                {item.flashSalePrice && <del>{item.price.toLocaleString("id-ID")} CC</del>}
                {isKycApproved ? (
                  <button className="primary-action" onClick={() => purchase(item.id)}>Purchase</button>
                ) : (
                  <button className="primary-action" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Terkunci (Butuh KYC)</button>
                )}
              </article>
            ))}
          </section>
        )}
      </AnimatedSection>
    </main>
  );
}
