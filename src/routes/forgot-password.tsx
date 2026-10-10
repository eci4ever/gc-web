import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const request = useMutation({
    mutationFn: (email: string) => http.post("/api/auth/forgot-password", { email }),
    onSuccess: () => setSent(true),
    onError: () => {
      setFormError("Something went wrong. Please try again.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const data = new FormData(event.currentTarget);
    request.mutate(formString(data, "email"));
  }

  return (
    <AuthShell
      title="Lupa kata laluan"
      description="Masukkan email anda dan kami akan hantar pautan set semula."
      footer={
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Kembali ke log masuk
        </Link>
      }
    >
      {sent ? (
        <Alert>
          <AlertDescription>
            Jika akaun dengan email itu wujud, pautan set semula telah dihantar. Sila semak kotak
            masuk anda.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
          </FieldGroup>
          {formError ? (
            <Alert role="alert" variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={request.isPending}>
            {request.isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Menghantar…
              </>
            ) : (
              "Hantar pautan"
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
