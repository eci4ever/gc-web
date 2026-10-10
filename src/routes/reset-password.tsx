import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { http } from "@/lib/api";
import { formString } from "@/lib/form";

type ResetSearch = { token?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      http.post("/api/auth/reset-password", body),
    onSuccess: () => {
      void navigate({ to: "/login", search: { reset: "1" } });
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : "Set semula gagal.");
    },
  });

  if (!token) {
    return (
      <AuthShell
        title="Pautan tidak sah"
        description="Pautan set semula tiada atau tidak lengkap."
        footer={
          <Link
            to="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Mohon pautan baharu
          </Link>
        }
      />
    );
  }

  const verifiedToken = token;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const data = new FormData(event.currentTarget);
    const password = formString(data, "password");
    const confirm = formString(data, "confirm");
    if (password !== confirm) {
      setFormError("Kata laluan tidak sepadan.");
      return;
    }
    reset.mutate({ token: verifiedToken, password });
  }

  return (
    <AuthShell title="Kata laluan baharu" description="Pilih kata laluan baharu untuk akaun anda.">
      <form onSubmit={onSubmit} className="grid gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Kata laluan baharu</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm">Sahkan kata laluan</FieldLabel>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </Field>
        </FieldGroup>
        {formError ? (
          <Alert role="alert" variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" disabled={reset.isPending}>
          {reset.isPending ? (
            <>
              <Spinner data-icon="inline-start" />
              Menyimpan…
            </>
          ) : (
            "Simpan kata laluan"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
