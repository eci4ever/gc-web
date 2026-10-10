import { cn } from "cn";

/** First focusable element on the page; jumps past repeated chrome.
 *  Sits just above the viewport and slides in on keyboard focus. */
export function SkipLink({ target = "main-content" }: { target?: string }) {
  return (
    <a
      href={`#${target}`}
      className={cn(
        "fixed left-4 top-4 z-50 -translate-y-20 rounded-lg bg-primary",
        "px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg",
        "transition-transform focus:translate-y-0 focus-visible:translate-y-0",
      )}
    >
      Langkau ke kandungan
    </a>
  );
}
