import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, type Me } from "@/lib/api";
import { formString } from "@/lib/form";
import { redirectIfAuthenticated } from "@/lib/guards";

type LoginSearch = {
  redirect?: string;
  reset?: string;
  error?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    reset: typeof search.reset === "string" ? search.reset : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  beforeLoad: async ({ context }) => {
    await redirectIfAuthenticated(context.queryClient);
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo, reset, error } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const me = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!me.ok) {
        const payload = (await me.json().catch(() => null)) as { error?: string } | null;
        throw new ApiError(me.status, payload?.error ?? me.statusText);
      }
      return (await me.json()) as Me;
    },
    onSuccess: async (me) => {
      queryClient.setQueryData(["me"], me);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      void navigate({ to: redirectTo || "/app" });
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : "Log masuk gagal.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const data = new FormData(event.currentTarget);
    login.mutate({
      email: formString(data, "email"),
      password: formString(data, "password"),
    });
  }

  return (
    <AuthShell
      title="Log masuk"
      description="Masuk ke workspace anda."
      footer={
        <>
          Belum ada akaun?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Daftar
          </Link>
        </>
      }
    >
      {reset ? (
        <Alert role="status" className="mb-4">
          <AlertDescription>
            Kata laluan telah ditukar. Sila log masuk dengan kata laluan baharu.
          </AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert role="alert" variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <form onSubmit={onSubmit} className="grid gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Kata laluan</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
        </FieldGroup>
        {formError ? (
          <Alert role="alert" variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Spinner data-icon="inline-start" />
              Sedang log masuk…
            </>
          ) : (
            "Log masuk"
          )}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Lupa kata laluan?
        </Link>
      </div>
    </AuthShell>
  );
}
