"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import Script from "next/script";

export default function ThemeInjector({ activeWebCode, platformTheme }: { activeWebCode: string | null, platformTheme?: any }) {
  const [cssPath, setCssPath] = useState<string | null>(null);
  const [rawCss, setRawCss] = useState<string | null>(null);
  
  const setBaseTheme = useThemeStore(s => s.setBaseTheme);
  const setEffectLayer = useThemeStore(s => s.setEffectLayer);
  const setCustomEffectUrl = useThemeStore(s => (s as any).setCustomEffectUrl);

  useEffect(() => {
    // Sinkronisasi platform theme ke Zustand store saat mount/berubah
    if (platformTheme) {
      if (platformTheme.baseTheme) setBaseTheme(platformTheme.baseTheme);
      if (platformTheme.effectLayer) setEffectLayer(platformTheme.effectLayer);
      if (platformTheme.customEffectUrl && setCustomEffectUrl) {
        setCustomEffectUrl(platformTheme.customEffectUrl);
      }
    }
  }, [platformTheme, setBaseTheme, setEffectLayer, setCustomEffectUrl]);

  useEffect(() => {
    if (!activeWebCode) {
      setCssPath(null);
      setRawCss(null);
      return;
    }

    if (activeWebCode.startsWith("/") || activeWebCode.startsWith("http")) {
      setCssPath(activeWebCode);
      setRawCss(null);
    } else {
      setRawCss(activeWebCode);
      setCssPath(null);
    }
  }, [activeWebCode]);

  return (
    <>
      {/* Inject eksternal stylesheet web code user */}
      {cssPath && <link rel="stylesheet" href={cssPath} />}
      {/* Inject raw CSS user */}
      {rawCss && <style dangerouslySetInnerHTML={{ __html: rawCss }} />}
      
      {/* Inject Custom Effect dari Global Platform Theme */}
      {platformTheme?.effectLayer === "custom" && platformTheme?.customEffectUrl && (
        <Script src={platformTheme.customEffectUrl} strategy="lazyOnload" />
      )}
    </>
  );
}
