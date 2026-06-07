import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p>404 - Uncharted Territory</p>
      <h1>The path you seek lies beyond the known kingdom.</h1>
      <Link href="/" className="primary-action">Return to the kingdom</Link>
    </main>
  );
}
