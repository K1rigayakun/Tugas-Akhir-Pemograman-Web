"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { API_URL } from "../../lib/api";
type Leader = {
  position: number;
  userId: string;
  username: string;
  rank: string;
  value: number;
};
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
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/leaderboard/${category}?limit=50`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) setLeaders(data);
        } else {
          setLeaders([]);
        }
      } catch {
        setLeaders([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category]);

  const podium = [leaders[1], leaders[0], leaders[2]].filter(Boolean);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Grand Rankings" title="A Chronicle of Ambition" description="Tujuh papan peringkat yang mencatat kekayaan, kemenangan, koleksi, dan kejayaan para bangsawan." />
      <AnimatedSection delay={100}>
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
      </AnimatedSection>

      <AnimatedSection staggerChildren staggerSelector=".podium-card" delay={250}>
        {isLoading ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>Mengkalkulasi peringkat...</p>
        ) : leaders.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>Belum ada data untuk kategori ini.</p>
        ) : (
          <>
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

            {leaders.length > 3 && (
              <AnimatedSection delay={400}>
                <section className="panel ranking-table" style={{ marginTop: "2rem" }}>
                  {leaders.slice(3).map((leader) => (
                    <div key={leader.userId}>
                      <strong>#{leader.position}</strong>
                      <span className="avatar-mini">{leader.username.slice(0, 1)}</span>
                      <p>{leader.username}<small>{leader.rank}</small></p>
                      <b>{leader.value.toLocaleString("id-ID")}</b>
                    </div>
                  ))}
                </section>
              </AnimatedSection>
            )}
          </>
        )}
      </AnimatedSection>
      <AnimatedSection delay={500}>
        <aside className="my-position panel">Posisi Anda akan muncul setelah login.</aside>
      </AnimatedSection>
    </main>
  );
}
