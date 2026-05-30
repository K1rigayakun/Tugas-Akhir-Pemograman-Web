export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 5vw, 4rem)",
          textAlign: "center",
        }}
      >
        <span className="gradient-gold" style={{
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Emerald Kingdom
        </span>
      </h1>
      <p
        style={{
          fontFamily: "var(--font-subheading)",
          color: "var(--color-gold)",
          marginTop: "1rem",
          fontSize: "1.25rem",
          letterSpacing: "0.1em",
        }}
      >
        Where Fortune Meets Glory
      </p>
      <p
        style={{
          color: "var(--color-ivory)",
          marginTop: "0.5rem",
          opacity: 0.7,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontSize: "0.875rem",
        }}
      >
        Bid. Conquer. Ascend.
      </p>
    </main>
  );
}
