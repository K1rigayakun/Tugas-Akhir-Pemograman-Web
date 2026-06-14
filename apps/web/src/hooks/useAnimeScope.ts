// apps/web/src/hooks/useAnimeScope.ts
// React hook wrapper untuk Anime.js v4 createScope + auto-cleanup

"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createScope, type Scope } from "animejs";

/**
 * useAnimeScope — hook untuk mengikat animasi Anime.js v4 ke scope React component.
 *
 * Cara pakai:
 * ```tsx
 * function MyComponent() {
 *   const rootRef = useRef<HTMLDivElement>(null);
 *   const scope = useAnimeScope(rootRef, (self) => {
 *     animate('.my-element', { opacity: [0, 1], duration: 600 });
 *   });
 *   return <div ref={rootRef}>...</div>;
 * }
 * ```
 *
 * - Animasi dibuat di dalam callback `setup`.
 * - Scope otomatis di-revert saat component unmount.
 * - `deps` bisa ditambahkan untuk re-run setup saat ada perubahan.
 */
export function useAnimeScope(
  rootRef: RefObject<HTMLElement | null>,
  setup: (scope: Scope | undefined) => void,
  deps: unknown[] = []
) {
  const scopeRef = useRef<Scope | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    // Buat scope baru yang di-bind ke root element
    scopeRef.current = createScope({ root: rootRef }).add(setup);

    // Cleanup: revert semua animasi saat unmount atau re-run
    return () => {
      scopeRef.current?.revert();
      scopeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, ...deps]);

  return scopeRef;
}
