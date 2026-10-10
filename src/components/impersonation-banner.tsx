import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { http } from "@/lib/api";

export function ImpersonationBanner({ active }: { active: boolean }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const stop = useMutation({
    mutationFn: () => http.post("/api/auth/stop-impersonating"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await navigate({ to: "/app/admin/users" });
    },
  });

  if (!active) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-500/15 px-4 py-2 text-sm text-amber-900 dark:text-amber-200">
      <p>Anda sedang menamax sesi pengguna lain. Semua tindakan direkodkan dalam log audit.</p>
      <Button variant="outline" size="sm" onClick={() => stop.mutate()} disabled={stop.isPending}>
        <LogOutIcon data-icon="inline-start" />
        Berhenti menamax
      </Button>
    </div>
  );
}
