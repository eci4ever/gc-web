import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { SkipLink } from "@/components/skip-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePageTitle } from "@/lib/use-page-title";

interface AuthShellProps {
  title: string;
  description: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  usePageTitle(title);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <SkipLink />
      <main id="main-content" className="w-full max-w-sm">
        <BrandMark center className="mb-8" />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer ? (
            <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
              {footer}
            </CardFooter>
          ) : null}
        </Card>
      </main>
    </div>
  );
}
