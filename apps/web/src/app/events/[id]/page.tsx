import Link from "next/link";
import PageHeading from "../../../components/PageHeading";
import { fetchApi } from "../../../lib/api";
import { demoEvents, demoLeaders } from "../../../lib/demo";

export default async function EventDetail({ params }: { params: { id: string } }) {
  const fallback = demoEvents.find((event) => event.id === params.id) || demoEvents[0];
  const event = await fetchApi(`/events/${params.id}`, fallback);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow={event.isActive ? "Active Festival" : "Festival Archive"} title={event.name} description={event.theme} />
      <section className="data-grid">
        <article className="content-card"><h2>Season Window</h2><p>{new Date(event.startTime).toLocaleString("id-ID")} hingga {new Date(event.endTime).toLocaleString("id-ID")}</p></article>
        <article className="content-card"><h2>EXP Blessing</h2><p className="metric">{event.expMultiplier}x multiplier</p></article>
        <article className="content-card"><h2>Exclusive Rewards</h2><p>Achievement dan cosmetic event akan muncul selama festival aktif.</p></article>
      </section>
      <h2 className="section-title">Festival Leaders</h2>
      <section className="panel ranking-table">
        {demoLeaders.slice(0, 5).map((leader) => <div key={leader.userId}><strong>#{leader.position}</strong><p>{leader.username}<small>{leader.rank}</small></p><b>{leader.value.toLocaleString("id-ID")}</b></div>)}
      </section>
      <Link href="/events" className="text-link">Kembali ke kalender event</Link>
    </main>
  );
}
