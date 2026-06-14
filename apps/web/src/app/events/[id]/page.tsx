import Link from "next/link";
import { fetchApi } from "../../../lib/api";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await fetchApi<any>(`/events/${params.id}`, null);
  
  if (!event) {
    return (
      <main className="page-wrap" style={{ textAlign: "center", padding: "4rem" }}>
        <h1>Festival Tidak Ditemukan</h1>
        <Link href="/events" className="text-link">Kembali ke Kalender</Link>
      </main>
    );
  }

  // Karena ini Server Component, kita buat wrapper client untuk animasi tema
  return (
    <EventDetailClient event={event} />
  );
}
