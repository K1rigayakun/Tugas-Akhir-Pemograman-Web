import Link from "next/link";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import { fetchApi } from "../../lib/api";


export default async function EventsPage() {
  const events = await fetchApi<any[]>("/events", []);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Festival Calendar" title="Seasons of the Kingdom" description="Event aktif, festival mendatang, dan arsip musim yang telah berakhir." />
      <AnimatedSection staggerChildren staggerSelector=".event-card" delay={200}>
        {events.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>Tidak ada event yang sedang berlangsung atau dijadwalkan.</p>
        ) : (
          <section className="event-list">
            {events.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id} className={`panel event-card ${event.isActive ? "active" : ""}`}>
                <span>{event.isActive ? "Active now" : new Date(event.startTime) > new Date() ? "Upcoming" : "Archive"}</span>
                <h2>{event.name}</h2>
                <p>{event.theme}</p>
                <strong>{event.expMultiplier}x EXP</strong>
                <time>{new Date(event.startTime).toLocaleDateString("id-ID")} - {new Date(event.endTime).toLocaleDateString("id-ID")}</time>
              </Link>
            ))}
          </section>
        )}
      </AnimatedSection>
    </main>
  );
}
