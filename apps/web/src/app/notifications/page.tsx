"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import { API_URL } from "../../lib/api";

type Notification = { id: string; type: string; payload: Record<string, unknown>; isRead: boolean; createdAt: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const token = () => localStorage.getItem("accessToken") || "";
  const load = () => fetch(`${API_URL}/notifications?unread=${filter === "unread"}`, { headers: { Authorization: `Bearer ${token()}` } })
    .then((response) => response.ok ? response.json() : { data: [] })
    .then((result) => setItems(result.data || []))
    .catch(() => setItems([]));
  useEffect(() => {
    void load();
  }, [filter]);

  async function readAll() {
    await fetch(`${API_URL}/notifications/read-all`, { method: "PUT", headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Herald's Scroll" title="Messages Across the Realm" description="Peringatan bid, hasil lelang, kenaikan rank, status KYC, dan keamanan akun." />
      <div className="toolbar">
        <button className={`tool-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`tool-button ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>Unread</button>
        <button className="tool-button" onClick={readAll}>Mark all read</button>
      </div>
      <section className="notification-list">
        {!items.length && <p className="panel empty-state">Belum ada notifikasi, atau Anda belum login.</p>}
        {items.map((item) => <article key={item.id} className={`panel notification-item ${item.isRead ? "" : "unread"}`}><span>{item.type.replace(/_/g, " ")}</span><p>{String(item.payload.message || "Aktivitas baru tercatat di akun Anda.")}</p><time>{new Date(item.createdAt).toLocaleString("id-ID")}</time></article>)}
      </section>
    </main>
  );
}
