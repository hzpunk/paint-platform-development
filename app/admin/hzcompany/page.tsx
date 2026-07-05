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
        <p className="text-sm text-muted-foreground">Актуальная информация о сотрудничестве, выручке и эффективности.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Заработок HzCompany</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">3.8M ₽</p>
            <p className="text-sm text-muted-foreground">по текущему сотрудничеству</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Эффективность маркетинга</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">+18%</p>
            <p className="text-sm text-muted-foreground">к конверсии и лидам</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Рост компании</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">+24%</p>
            <p className="text-sm text-muted-foreground">по сравнению с прошлым периодом</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Состояние сотрудничества</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Активное сотрудничество</p>
          <p>• Планируется расширение кампаний</p>
          <p>• Сбор аналитики по эффективности</p>
        </CardContent>
      </Card>
    </div>
  );
}
