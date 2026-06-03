// apps/web/src/app/page.tsx
import HeroSection          from "../components/home/HeroSection";
import FeaturedItems        from "../components/home/FeaturedItems";
import EndingSoon           from "../components/home/EndingSoon";
import LeaderboardSnapshot  from "../components/home/LeaderboardSnapshot";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedItems />
      <EndingSoon />
      <LeaderboardSnapshot />
    </main>
  );
}