"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import { API_URL } from "../../lib/api";
import { demoLeaders } from "../../lib/demo";

type Leader = (typeof demoLeaders)[number];
const categories = [
  ["top-spender", "Grand Treasurer"],
  ["most-wins", "Conquerors"],
  ["highest-streak", "Chain of Glory"],
  ["rare-collector", "Rare Vault"],
  ["highest-rank", "Order of Nobility"],
  ["event-champion", "Seasonal Champions"],
  ["live-auction-king", "Arena Kings"],
];

export default function LeaderboardPage() {
  const [category, setCategory] = useState("top-spender");
  const [period, setPeriod] = useState("weekly");
  const [leaders, setLeaders] = useState<Leader[]>(demoLeaders);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/leaderboard/${category}?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length) setLeaders(data);
        }
      } catch {
        setLeaders(demoLeaders);
      }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category, period]);

  const podium = [leaders[1], leaders[0], leaders[2]].filter(Boolean);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Grand Rankings" title="A Chronicle of Ambition" description="Tujuh papan peringkat yang mencatat kekayaan, kemenangan, koleksi, dan kejayaan para bangsawan." />
      <div className="toolbar">
        {categories.map(([value, label]) => (
          <button key={value} className={`tool-button ${category === value ? "active" : ""}`} onClick={() => setCategory(value)}>{label}</button>
        ))}
      </div>
      <div className="toolbar">
        {["weekly", "monthly", "all-time"].map((value) => (
          <button key={value} className={`tool-button ${period === value ? "active" : ""}`} onClick={() => setPeriod(value)}>{value.replace("-", " ")}</button>
        ))}
      </div>

      <section className="podium-grid">
        {podium.map((leader) => (
          <article key={leader.userId} className={`panel podium-card place-${leader.position}`}>
            <span>#{leader.position}</span>
            <div className="avatar-seal">{leader.username.slice(0, 1)}</div>
            <h2>{leader.username}</h2>
            <p>{leader.rank}</p>
            <strong>{leader.value.toLocaleString("id-ID")}</strong>
          </article>
        ))}
      </section>

      <section className="panel ranking-table">
        {leaders.slice(3).map((leader) => (
          <div key={leader.userId}>
            <strong>#{leader.position}</strong>
            <span className="avatar-mini">{leader.username.slice(0, 1)}</span>
            <p>{leader.username}<small>{leader.rank}</small></p>
            <b>{leader.value.toLocaleString("id-ID")}</b>
          </div>
        ))}
      </section>
      <aside className="my-position panel">Posisi Anda akan muncul setelah login.</aside>
    </main>
  );
}
