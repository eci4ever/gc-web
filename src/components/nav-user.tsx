import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOutIcon, MonitorIcon, MoonIcon, StopCircleIcon, SunIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { http, type Me } from "@/lib/api";
import { useTheme, type Theme } from "@/components/theme-provider";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Cerah", icon: SunIcon },
  { value: "dark", label: "Gelap", icon: MoonIcon },
  { value: "system", label: "Sistem", icon: MonitorIcon },
];

export function NavUser({ me }: { me: Me }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const logout = useMutation({
    mutationFn: () => http.post("/api/auth/logout"),
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      void navigate({ to: "/login" });
    },
    onError: (error) => toast.error(error.message),
  });

  const stopImpersonating = useMutation({
    mutationFn: () => http.post("/api/auth/stop-impersonating"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await navigate({ to: "/app/admin/users", search: { page: 1 } });
    },
    onError: (error) => toast.error(error.message),
  });

  const initials = me.user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-auto w-full justify-start gap-2 p-2" />}
      >
        <Avatar className="size-7">
          <AvatarImage src={me.user.avatar_url ?? undefined} alt={me.user.name} />
          <AvatarFallback className="text-xs">{initials || "U"}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-medium">{me.user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{me.user.email}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{me.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{me.user.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/app/account" />}>
          <UserIcon data-icon="inline-start" />
          Akaun
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunIcon data-icon="inline-start" />
            Tema
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuGroup>
              {THEME_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={theme === option.value}
                  onCheckedChange={() => setTheme(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {me.impersonated_by ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => stopImpersonating.mutate()}>
              <StopCircleIcon data-icon="inline-start" />
              Berhenti menamax
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate()}>
          <LogOutIcon data-icon="inline-start" />
          Log keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
