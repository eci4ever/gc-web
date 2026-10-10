import { useEffect } from "react";

/** Set the document title for the current view (route changes reset it). */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · GC-RUST`;
  }, [title]);
}
