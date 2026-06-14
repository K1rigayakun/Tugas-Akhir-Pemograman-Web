"use client";

import { useEffect, useState } from "react";

export default function ThemeInjector({ activeWebCode }: { activeWebCode: string | null }) {
  const [cssPath, setCssPath] = useState<string | null>(null);
  const [rawCss, setRawCss] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWebCode) {
      setCssPath(null);
      setRawCss(null);
      return;
    }

    // Periksa apakah web code berbentuk URL path (/tampilan/.../index.css)
    if (activeWebCode.startsWith("/") || activeWebCode.startsWith("http")) {
      setCssPath(activeWebCode);
      setRawCss(null);
    } else {
      // Jika text mentah CSS
      setRawCss(activeWebCode);
      setCssPath(null);
    }
  }, [activeWebCode]);

  return (
    <>
      {/* Inject eksternal stylesheet jika ada */}
      {cssPath && <link rel="stylesheet" href={cssPath} />}
      
      {/* Inject raw CSS jika ada */}
      {rawCss && <style dangerouslySetInnerHTML={{ __html: rawCss }} />}
    </>
  );
}
