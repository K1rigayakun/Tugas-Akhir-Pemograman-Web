"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "rgba(5, 7, 9, 0.95)",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "4rem 2rem 2rem 2rem",
      marginTop: "4rem",
      fontFamily: "var(--font-body)",
      color: "rgba(255,255,255,0.6)",
      fontSize: "0.85rem",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "3rem",
        marginBottom: "3rem",
      }}>
        {/* Identitas Web */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{
              width: "32px", height: "32px",
              background: "var(--color-emerald)",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--color-ivory)" }}>
              Emerald Kingdom
            </h3>
          </div>
          <p style={{ lineHeight: 1.6, marginBottom: "1rem" }}>
            Platform lelang eksklusif untuk barang langka, properti mewah, dan peninggalan bernilai tinggi.
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-emerald)" }}>
            SK Kemenkumham RI No. AHU-0012345.AH.01.02.Tahun 2026<br/>
            Bersertifikat ISO/IEC 27001:2022
          </p>
        </div>

        {/* Tautan Cepat */}
        <div>
          <h4 style={{ color: "var(--color-ivory)", fontWeight: 600, marginBottom: "1.2rem", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem" }}>
            Tautan Cepat
          </h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li><Link href="/auction" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-emerald)"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Royal Market</Link></li>
            <li><Link href="/museum" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-emerald)"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Museum Artefak</Link></li>
            <li><Link href="/leaderboard" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-emerald)"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Leaderboard</Link></li>
            <li><Link href="/help" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-emerald)"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>Pusat Bantuan</Link></li>
          </ul>
        </div>

        {/* Hubungi Kami */}
        <div>
          <h4 style={{ color: "var(--color-ivory)", fontWeight: 600, marginBottom: "1.2rem", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem" }}>
            Hubungi Kami
          </h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li>Menara Emerald, Lt. 45<br/>Jl. Jend. Sudirman Kav. 1, Jakarta</li>
            <li>Telepon: +62 21 555 1234</li>
            <li>Email: support@emeraldkingdom.id</li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        paddingTop: "2rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "1rem",
        fontSize: "0.75rem",
      }}>
        <p>&copy; {new Date().getFullYear()} Emerald Kingdom. Hak Cipta Dilindungi Undang-Undang.</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Syarat & Ketentuan</Link>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Kebijakan Privasi</Link>
        </div>
      </div>
    </footer>
  );
}
