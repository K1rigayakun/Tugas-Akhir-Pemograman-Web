"use client";

import { useEffect, useState } from "react";
import PageHeading from "../../components/PageHeading";
import { API_URL } from "../../lib/api";
import { demoAchievements } from "../../lib/demo";

type Achievement = (typeof demoAchievements)[number];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(demoAchievements);
  useEffect(() => {
    fetch(`${API_URL}/achievements`)
      .then((response) => response.ok ? response.json() : demoAchievements)
      .then((data) => Array.isArray(data) && data.length && setAchievements(data))
      .catch(() => setAchievements(demoAchievements));
  }, []);

  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Triumph Registry" title="Every Victory Leaves a Mark" description="Lihat pencapaian yang sudah diraih, progres berikutnya, dan reward yang menunggu." />
      <section className="achievement-grid">
        {achievements.map((achievement) => {
          const progress = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
          return (
            <article key={achievement.id} className={`content-card achievement-card ${achievement.isUnlocked ? "unlocked" : "locked"} tier-${achievement.tier.toLowerCase()}`}>
              <span>{achievement.tier}</span>
              <h2>{achievement.name}</h2>
              <p>{achievement.description}</p>
              <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
              <small>{achievement.progress.toLocaleString("id-ID")} / {achievement.target.toLocaleString("id-ID")}</small>
              <strong>+{achievement.expReward} EXP</strong>
            </article>
          );
        })}
      </section>
    </main>
  );
}
