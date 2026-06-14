"use client";

import Script from "next/script";

export default function CosmeticRenderer({ scriptUrls }: { scriptUrls: string[] }) {
  if (!scriptUrls || scriptUrls.length === 0) return null;

  return (
    <>
      {scriptUrls.map((url, index) => (
        <Script 
          key={url + index}
          src={url} 
          strategy="lazyOnload" 
        />
      ))}
    </>
  );
}
