import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";

export function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <BrandMark className="mb-10" />
      <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-heading text-base font-semibold text-foreground">{heading}</h2>
      {children}
    </section>
  );
}
