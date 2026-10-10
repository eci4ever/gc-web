import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

/** Single-word page title; the sidebar carries the hierarchy. */
export function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <h1 className="font-heading text-sm font-medium">{title}</h1>
      </div>
    </header>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col gap-4 p-4 pt-0 lg:p-6 lg:pt-4">{children}</div>;
}
