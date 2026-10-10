import { useEffect, useRef, type ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePageTitle } from "@/lib/use-page-title";

/** Single-word page title; the sidebar carries the hierarchy.
 *  Also owns the document title and moves focus to the view heading
 *  on navigation so screen-reader users land in the new content. */
export function PageHeader({ title }: { title: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  usePageTitle(title);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-sm font-medium outline-none"
        >
          {title}
        </h1>
      </div>
    </header>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col gap-4 p-4 pt-0 lg:p-6 lg:pt-4">{children}</div>;
}
