"use client";

import { useEffect } from "react";
import { DisplayPreferences } from "../lib/userPreferences";
import { useThemeStore } from "../store/useThemeStore";

export default function DisplayPreferenceInjector({
  preferences,
}: {
  preferences: DisplayPreferences | null;
}) {
  const setBaseTheme = useThemeStore((state) => state.setBaseTheme);
  const setEffectLayer = useThemeStore((state) => state.setEffectLayer);

  useEffect(() => {
    if (!preferences) return;

    document.documentElement.dataset.ekAppearance = preferences.appearance;
    document.documentElement.dataset.ekDensity = preferences.layoutDensity;
    document.documentElement.dataset.ekMotion = preferences.reduceMotion ? "reduced" : "full";

    setBaseTheme(
      preferences.appearance === "royal"
        ? "royal-velvet"
        : preferences.appearance === "high-contrast"
        ? "abyssal-blue"
        : "carbon-hexagon",
    );

    setEffectLayer(
      preferences.reduceMotion || !preferences.backgroundEffects
        ? "none"
        : "emerald-particles",
    );

    return () => {
      delete document.documentElement.dataset.ekAppearance;
      delete document.documentElement.dataset.ekDensity;
      delete document.documentElement.dataset.ekMotion;
    };
  }, [preferences, setBaseTheme, setEffectLayer]);

  if (!preferences) return null;

  return (
    <style>{`
      html[data-ek-appearance="royal"] {
        --color-bg-dark: #120707;
        --color-bg-mid: #2b0d16;
        --color-bg-deep: #3b1422;
        --color-emerald-primary: #c9a84c;
        --color-emerald-light: #f5d080;
        --color-emerald-dark: #9c6d18;
      }

      html[data-ek-appearance="high-contrast"] {
        --color-bg-dark: #020409;
        --color-bg-mid: #07121d;
        --color-bg-deep: #0b1f33;
        --color-ivory: #ffffff;
        --color-gold: #ffd54a;
        --color-emerald-primary: #7dd3fc;
        --color-emerald-light: #bae6fd;
        --color-emerald-dark: #0284c7;
      }

      html[data-ek-density="compact"] .page-wrap {
        padding-top: 42px;
        padding-bottom: 64px;
      }

      html[data-ek-density="compact"] .content-card,
      html[data-ek-density="compact"] .panel {
        padding: 14px;
      }

      html[data-ek-density="spacious"] .page-wrap {
        padding-top: 86px;
        padding-bottom: 118px;
      }

      html[data-ek-density="spacious"] .data-grid,
      html[data-ek-density="spacious"] .auction-grid,
      html[data-ek-density="spacious"] .achievement-grid {
        gap: 24px;
      }

      html[data-ek-motion="reduced"] *,
      html[data-ek-motion="reduced"] *::before,
      html[data-ek-motion="reduced"] *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.001ms !important;
      }
    `}</style>
  );
}
