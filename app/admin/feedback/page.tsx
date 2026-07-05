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
        <p className="text-sm text-muted-foreground">Отзывы пользователей, запросы в поддержку и модерация комментариев.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Отзывы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{reviews.length}</p>
            <p className="text-sm text-muted-foreground">новых откликов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Техподдержка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">8</p>
            <p className="text-sm text-muted-foreground">активных запросов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Модерация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">12</p>
            <p className="text-sm text-muted-foreground">комментариев на проверке</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние отзывы</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length ? (
            <ul className="space-y-3">
              {reviews.map((r: any) => (
                <li key={r.id} className="rounded-lg border border-border/70 p-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{r.user?.name}</span>
                    <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
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
