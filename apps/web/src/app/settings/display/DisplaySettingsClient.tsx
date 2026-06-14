"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { Palette, Save, Volume2, Waves } from "lucide-react";
import { updateDisplaySettingsAction } from "../../actions/settings";
import { DisplayPreferences } from "../../../lib/userPreferences";

interface WebThemeOption {
  id: string;
  name: string;
  rarity: string;
  description: string | null;
}

interface DisplaySettingsClientProps {
  initialPreferences: DisplayPreferences;
  webThemes: WebThemeOption[];
}

export default function DisplaySettingsClient({
  initialPreferences,
  webThemes,
}: DisplaySettingsClientProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const update = <K extends keyof DisplayPreferences>(key: K, value: DisplayPreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    setMessage("");
    startTransition(async () => {
      const result = await updateDisplaySettingsAction(preferences);
      setMessage(result.success ? "Pengaturan tampilan tersimpan." : result.error || "Gagal menyimpan.");
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-cinzel text-3xl text-gray-100">Pengaturan Tampilan</h1>
          <p className="mt-1 text-sm text-gray-400">Preferensi ini tersimpan di akun dan diterapkan ulang saat login.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-2 font-bold text-black transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-70"
        >
          <Save size={18} />
          {isPending ? "Menyimpan" : "Simpan"}
        </button>
      </div>

      {message && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <section className="rounded-lg border border-white/5 bg-white/5 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl text-amber-400">
          <Palette size={22} /> Tema Website
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-gray-300">
            Customization Aktif
            <select
              value={preferences.webThemeId || ""}
              onChange={(event) => update("webThemeId", event.target.value || null)}
              className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
            >
              <option value="">Default Emerald Kingdom</option>
              {webThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} ({theme.rarity})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-gray-300">
            Mode Event
            <select
              value={preferences.eventMode}
              onChange={(event) => update("eventMode", event.target.value as DisplayPreferences["eventMode"])}
              className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
            >
              <option value="follow">Ikuti event platform</option>
              <option value="personal">Pakai tampilan sendiri</option>
              <option value="platform">Event platform full</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-white/5 bg-white/5 p-6">
        <h2 className="mb-5 text-xl text-amber-400">Interface</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-gray-300">
            Appearance
            <select
              value={preferences.appearance}
              onChange={(event) => update("appearance", event.target.value as DisplayPreferences["appearance"])}
              className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
            >
              <option value="dark">Dark Mode</option>
              <option value="royal">Royal Contrast</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm text-gray-300">
            Bahasa
            <select
              value={preferences.language}
              onChange={(event) => update("language", event.target.value as DisplayPreferences["language"])}
              className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm text-gray-300">
            Layout Density
            <select
              value={preferences.layoutDensity}
              onChange={(event) => update("layoutDensity", event.target.value as DisplayPreferences["layoutDensity"])}
              className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
              <option value="spacious">Spacious</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-white/5 bg-white/5 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl text-amber-400">
          <Waves size={22} /> Animasi & Efek
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle label="Page Transitions" checked={preferences.pageTransitions} onChange={(value) => update("pageTransitions", value)} />
          <Toggle label="Background Effects" checked={preferences.backgroundEffects} onChange={(value) => update("backgroundEffects", value)} />
          <Toggle label="Reduce Motion" checked={preferences.reduceMotion} onChange={(value) => update("reduceMotion", value)} />
          <Toggle label="Sound Effects" checked={preferences.soundEffects} onChange={(value) => update("soundEffects", value)} icon={<Volume2 size={18} />} />
        </div>
      </section>

      <section className="rounded-lg border border-white/5 bg-white/5 p-6">
        <h2 className="mb-5 text-xl text-amber-400">Notifikasi</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle label="Email Notifications" checked={preferences.emailNotifications} onChange={(value) => update("emailNotifications", value)} />
          <Toggle label="Push Notifications" checked={preferences.pushNotifications} onChange={(value) => update("pushNotifications", value)} />
        </div>
      </section>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex min-h-14 items-center justify-between rounded-md border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-amber-400/60"
      aria-pressed={checked}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-gray-100">
        {icon}
        {label}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-500" : "bg-white/20"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
