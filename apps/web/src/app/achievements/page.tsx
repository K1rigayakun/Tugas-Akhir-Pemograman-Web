"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { fetchUserAchievementsAction } from "../actions/gamification";

type Achievement = {
  id: string;
  name: string;
  description: string;
  tier: string;
  progress: number;
  target: number;
  expReward: number;
  isUnlocked?: boolean;
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUserAchievementsAction();
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            ...item,
            progress: item.progress || 0,
            isUnlocked: item.isUnlocked || false,
          }));
          setAchievements(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch achievements", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Triumph Registry" title="Every Victory Leaves a Mark" description="Lihat pencapaian yang sudah diraih, progres berikutnya, dan reward yang menunggu." />
      <AnimatedSection staggerChildren staggerSelector=".achievement-card" delay={200}>
        {isLoading ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>Memuat catatan kemenangan...</p>
        ) : achievements.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>Belum ada pencapaian yang tersedia.</p>
        ) : (
          <section className="achievement-grid">
            {achievements.map((achievement) => {
              const target = achievement.target || 1;
              const progress = Math.min(100, Math.round(((achievement.progress || 0) / target) * 100));
              return (
                <article key={achievement.id} className={`content-card achievement-card ${achievement.isUnlocked ? "unlocked" : "locked"} tier-${(achievement.tier || 'bronze').toLowerCase()}`}>
                  <span>{achievement.tier}</span>
                  <h2>{achievement.name}</h2>
                  <p>{achievement.description}</p>
                  <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
                  <small>{(achievement.progress || 0).toLocaleString("id-ID")} / {(achievement.target || 0).toLocaleString("id-ID")}</small>
                  <strong>+{achievement.expReward || 0} EXP</strong>
                </article>
              );
            })}
          </section>
        )}
      </AnimatedSection>
    </main>
  );
}
