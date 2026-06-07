"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Loader2 } from "lucide-react";

/**
 * Kelola Event — Admin Panel
 */

export default function EventsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ 
    name: "", theme: "", expMultiplier: "1.5", startTime: "", endTime: "", color1: "#c9a84c", color2: "#0a2620" 
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/v1/admin/events");
      const data = await res.json();
      if (res.ok) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.theme || !formData.startTime || !formData.endTime) {
      setError("Semua field harus diisi.");
      return;
    }

    setIsProcessing(true);
    setError("");
    try {
      const res = await fetchWithAuth("/v1/admin/events", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          theme: formData.theme,
          expMultiplier: parseFloat(formData.expMultiplier),
          startTime: formData.startTime,
          endTime: formData.endTime,
          accentColors: [formData.color1, formData.color2]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat event");
      
      setShowCreate(false);
      setFormData({ name: "", theme: "", expMultiplier: "1.5", startTime: "", endTime: "", color1: "#c9a84c", color2: "#0a2620" });
      loadEvents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await fetchWithAuth(`/v1/admin/events/${id}/activate`, { method: "PUT" });
      if (res.ok) loadEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnd = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await fetchWithAuth(`/v1/admin/events/${id}/end`, { method: "PUT" });
      if (res.ok) loadEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ padding: "2.5rem", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "var(--color-ivory)" }}>Kelola Event</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Buat dan kelola event seasonal platform</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding: "0.6rem 1.25rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
          + Buat Event
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-gold)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "var(--color-gold)", marginBottom: "1.25rem" }}>Event Baru</h3>
          
          {error && (
            <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "var(--color-danger)", fontSize: "0.85rem", borderRadius: "8px", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {[
              { label: "Nama Event", key: "name", type: "text", placeholder: "The Grand Coronation" },
              { label: "Theme", key: "theme", type: "text", placeholder: "coronation" },
              { label: "EXP Multiplier", key: "expMultiplier", type: "number", placeholder: "1.5", step: "0.1" },
              { label: "Mulai", key: "startTime", type: "datetime-local", placeholder: "" },
              { label: "Selesai", key: "endTime", type: "datetime-local", placeholder: "" },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{field.label}</label>
                <input
                  type={field.type}
                  step={field.step}
                  value={(formData as any)[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "0.6rem", color: "var(--color-ivory)", fontSize: "0.85rem", marginTop: "0.35rem" }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Warna Aksen</label>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
                <input type="color" value={formData.color1} onChange={(e) => setFormData({ ...formData, color1: e.target.value })} style={{ width: "50px", height: "38px", border: "none", borderRadius: "6px", cursor: "pointer", background: "transparent" }} />
                <input type="color" value={formData.color2} onChange={(e) => setFormData({ ...formData, color2: e.target.value })} style={{ width: "50px", height: "38px", border: "none", borderRadius: "6px", cursor: "pointer", background: "transparent" }} />
              </div>
            </div>
          </div>
          <button onClick={handleCreate} disabled={isProcessing} style={{ padding: "0.5rem 1.5rem", background: "var(--color-gold)", color: "#0a0a0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? "Menyimpan..." : "Buat Event"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <Loader2 className="animate-spin" color="var(--color-gold)" size={32} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {events.map((evt) => {
            const colors = evt.accentColors || ["#c9a84c", "#0a2620"];
            return (
              <div key={evt.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
                {/* Color Banner */}
                <div style={{ height: "6px", background: `linear-gradient(90deg, ${colors[0]}, ${colors[1] || colors[0]})` }} />
                <div style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>{evt.name}</h4>
                      {evt.isActive ? (
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: "rgba(34,197,94,0.15)", color: "#22c55e", animation: "pulse 2s infinite" }}>ACTIVE</span>
                      ) : (
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", background: "rgba(138,138,154,0.15)", color: "#8a8a9a" }}>INACTIVE</span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      Theme: {evt.theme} | EXP: x{evt.expMultiplier} | {new Date(evt.startTime).toLocaleDateString("id-ID")} — {new Date(evt.endTime).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {!evt.isActive && (
                      <button onClick={() => handleActivate(evt.id)} disabled={isProcessing} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#22c55e", borderRadius: "6px", cursor: "pointer", opacity: isProcessing ? 0.6 : 1 }}>Aktifkan</button>
                    )}
                    {evt.isActive && (
                      <button onClick={() => handleEnd(evt.id)} disabled={isProcessing} style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "6px", cursor: "pointer", opacity: isProcessing ? 0.6 : 1 }}>Akhiri</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)", border: "1px dashed var(--color-border)", borderRadius: "12px" }}>
              Belum ada event yang dibuat.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
