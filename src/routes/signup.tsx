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

export const Route = createFileRoute("/signup")({
  beforeLoad: async ({ context }) => {
    await redirectIfAuthenticated(context.queryClient);
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const signup = useMutation({
    mutationFn: async (body: { name: string; email: string; password: string }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new ApiError(response.status, payload?.error ?? response.statusText);
      }
      return (await response.json()) as Me;
    },
    onSuccess: async (me) => {
      queryClient.setQueryData(["me"], me);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      void navigate({ to: "/app" });
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : "Pendaftaran gagal.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const data = new FormData(event.currentTarget);
    signup.mutate({
      name: formString(data, "name"),
      email: formString(data, "email"),
      password: formString(data, "password"),
    });
  }

  return (
    <AuthShell
      title="Daftar"
      description="Akaun pertama pada pangkalan data baharu menjadi pentadbir platform."
      footer={
        <>
          Sudah ada akaun?{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log masuk
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Nama</FieldLabel>
            <Input id="name" name="name" autoComplete="name" required maxLength={100} />
          </Field>
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
        <Button type="submit" disabled={signup.isPending}>
          {signup.isPending ? (
            <>
              <Spinner data-icon="inline-start" />
              Sedang mendaftar…
            </>
          ) : (
            "Daftar"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
