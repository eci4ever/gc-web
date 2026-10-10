import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { http, useMe } from "@/lib/api";
import { roleLabel } from "@/lib/access";
import { formString } from "@/lib/form";

interface OrgListItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  is_default: boolean;
}

export function WorkspaceSwitcher() {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const orgs = useQuery({
    queryKey: ["organizations"],
    queryFn: () => http.get<OrgListItem[]>("/api/organizations"),
  });

  const setActive = useMutation({
    mutationFn: (organizationId: string) =>
      http.post("/api/organizations/active", { organization_id: organizationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.invalidateQueries({ queryKey: ["org"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const create = useMutation({
    mutationFn: (name: string) => http.post("/api/organizations", { name }),
    onSuccess: async () => {
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.invalidateQueries({ queryKey: ["org"] });
      toast.success("Workspace dicipta.");
    },
    onError: (error) => toast.error(error.message),
  });

  function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = formString(new FormData(event.currentTarget), "name").trim();
    if (name) create.mutate(name);
  }

  return (
    <div className="grid gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="w-full" />}>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[0.6rem] font-bold text-primary-foreground">
            {(me?.org?.name ?? "GC-RUST").charAt(0).toUpperCase()}
          </div>
          <span className="truncate font-medium">{me?.org?.name ?? "Tiada workspace"}</span>
          <Badge variant="secondary" className="ml-auto shrink-0">
            {me?.org ? roleLabel(me.org.role) : "—"}
          </Badge>
          <ChevronsUpDownIcon className="ml-1 size-3 shrink-0 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            {orgs.data?.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => org.id !== me?.org?.organization_id && setActive.mutate(org.id)}
              >
                <span className="truncate">{org.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{roleLabel(org.role)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Workspace baharu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workspace baharu</AlertDialogTitle>
            <AlertDialogDescription>
              Anda menjadi owner workspace yang dicipta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form id="create-workspace" onSubmit={onCreate} className="grid gap-1.5">
            <Label htmlFor="nama-workspace" className="sr-only">
              Nama workspace
            </Label>
            <Input
              id="nama-workspace"
              name="name"
              placeholder="Nama workspace"
              required
              maxLength={100}
            />
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction type="submit" form="create-workspace" disabled={create.isPending}>
              Cipta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Link
        to="/"
        className="px-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        ← Halaman utama
      </Link>
    </div>
  );
}
