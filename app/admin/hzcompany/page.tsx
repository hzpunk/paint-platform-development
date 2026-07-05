import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminHzCompanyPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">HzCompany</h1>
        <p className="text-sm text-muted-foreground">Информация о сотрудничестве</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Заработок HzCompany</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Эффективность маркетинга</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Рост компании</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Состояние сотрудничества</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Активно</p>
        </CardContent>
      </Card>
    </div>
  );
}
