export default function AdminDashboard() {
  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
    }}>
      <h1 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "2rem",
        color: "#C9A84C",
        marginBottom: "1rem",
      }}>
        The Praetorian Console
      </h1>
      <p style={{ color: "#F5F0E8", opacity: 0.7 }}>
        Emerald Kingdom Admin Panel
      </p>
    </main>
  );
}
