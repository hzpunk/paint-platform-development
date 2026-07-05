import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const reviews = await prisma.review.findMany({ include: { user: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Обратная связь</h1>
        <p className="text-sm text-muted-foreground">Управление обратной связью</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Отзывы</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length ? (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <span className="font-semibold">{r.user?.name}</span>
                    <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Нет отзывов</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
