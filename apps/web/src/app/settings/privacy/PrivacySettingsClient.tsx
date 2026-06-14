"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff, Save, Shield } from "lucide-react";
import { updatePrivacySettingsAction } from "../../actions/settings";
import {
  ANONYMOUS_NAMES,
  PrivacyPreferences,
  ProfilePrivacyMode,
} from "../../../lib/userPreferences";

interface PrivacySettingsClientProps {
  initialPrivacyMode: ProfilePrivacyMode;
  initialPreferences: PrivacyPreferences;
}

export default function PrivacySettingsClient({
  initialPrivacyMode,
  initialPreferences,
}: PrivacySettingsClientProps) {
  const [privacyMode, setPrivacyMode] = useState(initialPrivacyMode);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const update = <K extends keyof PrivacyPreferences>(key: K, value: PrivacyPreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    setMessage("");
    startTransition(async () => {
      const result = await updatePrivacySettingsAction(privacyMode, preferences);
      setMessage(result.success ? "Pengaturan privasi tersimpan." : result.error || "Gagal menyimpan.");
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-cinzel text-3xl text-gray-100">Privasi</h1>
          <p className="mt-1 text-sm text-gray-400">Atur identitas publik dan bagian profil yang boleh terlihat.</p>
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
          <Shield size={22} /> Mode Profil
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <ModeButton
            active={privacyMode === "PUBLIC"}
            icon={<Eye size={20} />}
            title="PUBLIC"
            description="Profil dan nama asli terlihat sesuai toggle di bawah."
            onClick={() => setPrivacyMode("PUBLIC")}
          />
          <ModeButton
            active={privacyMode === "ANONYMOUS"}
            icon={<Shield size={20} />}
            title="ANONYMOUS"
            description="Nama publik diganti dengan alias medieval."
            onClick={() => setPrivacyMode("ANONYMOUS")}
          />
          <ModeButton
            active={privacyMode === "SHADOW"}
            icon={<EyeOff size={20} />}
            title="SHADOW"
            description="Profil publik ditutup dari pengguna lain."
            onClick={() => setPrivacyMode("SHADOW")}
          />
        </div>

        <label className="mt-5 grid max-w-md gap-2 text-sm text-gray-300">
          Nama anonim
          <select
            value={preferences.anonymousName}
            onChange={(event) => update("anonymousName", event.target.value)}
            className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
          >
            {ANONYMOUS_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-lg border border-white/5 bg-white/5 p-6">
        <h2 className="mb-5 text-xl text-amber-400">Apa yang Ditampilkan</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle label="Statistik bid dan win rate" checked={preferences.showBidStats} onChange={(value) => update("showBidStats", value)} />
          <Toggle label="Achievement showcase" checked={preferences.showAchievements} onChange={(value) => update("showAchievements", value)} />
          <Toggle label="Item kemenangan" checked={preferences.showWonItems} onChange={(value) => update("showWonItems", value)} />
          <Toggle label="Koleksi kosmetik" checked={preferences.showCosmetics} onChange={(value) => update("showCosmetics", value)} />
          <Toggle label="Rank dan EXP" checked={preferences.showRankExp} onChange={(value) => update("showRankExp", value)} />
          <Toggle label="Tanggal bergabung" checked={preferences.showJoinedAt} onChange={(value) => update("showJoinedAt", value)} />
          <Toggle label="Status online" checked={preferences.showOnlineStatus} onChange={(value) => update("showOnlineStatus", value)} />
        </div>
      </section>

      <section className="rounded-lg border border-white/5 bg-white/5 p-6">
        <h2 className="mb-5 text-xl text-amber-400">Riwayat & Watchlist</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-gray-300">
            Siapa yang bisa lihat riwayat bid
            <select
              value={preferences.bidHistoryVisibility}
              onChange={(event) => update("bidHistoryVisibility", event.target.value as PrivacyPreferences["bidHistoryVisibility"])}
              className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
            >
              <option value="EVERYONE">Semua</option>
              <option value="FRIENDS">Teman</option>
              <option value="NONE">Tidak ada</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm text-gray-300">
            Siapa yang bisa lihat watchlist
            <select
              value={preferences.watchlistVisibility}
              onChange={(event) => update("watchlistVisibility", event.target.value as PrivacyPreferences["watchlistVisibility"])}
              className="rounded-md border border-white/10 bg-black/50 px-4 py-3 text-gray-100 outline-none focus:border-amber-400"
            >
              <option value="EVERYONE">Semua</option>
              <option value="NONE">Tidak ada</option>
            </select>
          </label>
        </div>
      </section>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-32 rounded-lg border p-4 text-left transition ${
        active
          ? "border-amber-400 bg-amber-400/10 text-amber-200"
          : "border-white/10 bg-black/30 text-gray-300 hover:border-amber-400/60"
      }`}
    >
      <span className="mb-3 flex items-center gap-2 font-bold">{icon}{title}</span>
      <span className="text-sm leading-6 text-gray-400">{description}</span>
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex min-h-14 items-center justify-between rounded-md border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-amber-400/60"
      aria-pressed={checked}
    >
      <span className="text-sm font-semibold text-gray-100">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-500" : "bg-white/20"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
