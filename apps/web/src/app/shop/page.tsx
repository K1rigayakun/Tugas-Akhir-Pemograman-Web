"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import { API_URL, postApi } from "../../lib/api";
import { demoShop } from "../../lib/demo";

type ShopItem = (typeof demoShop)[number];

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>(demoShop);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch(`${API_URL}/shop/items`).then((response) => response.ok ? response.json() : demoShop).then((data) => Array.isArray(data) && data.length && setItems(data)).catch(() => setItems(demoShop));
  }, []);
  async function purchase(id: string) {
    const token = localStorage.getItem("accessToken");
    if (!token) return setMessage("Login dan selesaikan KYC sebelum membeli.");
    try {
      await postApi(`/shop/purchase/${id}`, { idempotencyKey: `web-${id}-${Date.now()}` }, token);
      setMessage("Pembelian berhasil. Item masuk ke koleksi Anda.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Pembelian gagal.");
    }
  }
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Royal Market" title="Treasures for Your Identity" description="Gunakan Crown Coin untuk cosmetic, banner, frame, dan item limited edition." />
      {message && <p className="status-message">{message}</p>}
      <section className="data-grid shop-grid">
        {items.map((item) => (
          <article key={item.id} className="content-card shop-card">
            <span>{item.isLimited ? `Limited${item.stock ? ` - ${item.stock} left` : ""}` : item.type}</span>
            <div className="shop-preview">{item.name.slice(0, 1)}</div>
            <h2>{item.name}</h2>
            <p className="metric">{(item.flashSalePrice || item.price).toLocaleString("id-ID")} CC</p>
            {item.flashSalePrice && <del>{item.price.toLocaleString("id-ID")} CC</del>}
            <button className="primary-action" onClick={() => purchase(item.id)}>Purchase</button>
          </article>
        ))}
      </section>
    </main>
  );
}
