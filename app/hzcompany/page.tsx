import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HzCompanyPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Супер админ</h1>
        <p className="text-sm text-muted-foreground">Полный доступ к админке</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрый доступ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Вы можете перейти в любую секцию через боковое меню
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
