import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";

import { PageBody, PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { http } from "@/lib/api";
import { roleLabel } from "@/lib/access";

interface MemberInfo {
  id: string;
  user_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  joined_at: string;
}

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  is_default: boolean;
  my_role: string;
  members: MemberInfo[];
}

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { me } = Route.useRouteContext();

  const org = useQuery({
    queryKey: ["org"],
    queryFn: () => http.get<OrgDetail>("/api/organizations/current"),
    retry: false,
  });

  const members = org.data?.members ?? [];

  return (
    <>
      <PageHeader title="Dashboard" />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Workspace</CardDescription>
              <CardTitle className="truncate text-lg">
                {org.data?.name ?? me.org?.name ?? "—"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Ahli</CardDescription>
              <CardTitle className="text-lg">{members.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Peranan anda</CardDescription>
              <CardTitle className="text-lg">{roleLabel(me.org?.role ?? "member")}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ahli</CardTitle>
            <CardDescription>Semua ahli workspace aktif ini.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                <Avatar className="size-8">
                  <AvatarImage src={member.avatar_url ?? undefined} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <Badge variant={member.role === "member" ? "secondary" : "default"}>
                  {roleLabel(member.role)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {me.org && (me.org.role === "owner" || me.org.role === "admin") ? (
          <Button variant="outline" render={<Link to="/app/manage" />}>
            Urus workspace
            <ExternalLinkIcon data-icon="inline-end" />
          </Button>
        ) : null}
      </PageBody>
    </>
  );
}
