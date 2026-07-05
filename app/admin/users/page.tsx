import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const users = await prisma.user.findMany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Пользователи</h1>
        <p className="text-sm text-muted-foreground">Управление пользователями</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Список пользователей</CardTitle>
            <Input placeholder="Поиск..." className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Имя</th>
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-left py-2 px-2">Роль</th>
                  <th className="text-left py-2 px-2">Бонусы</th>
                  <th className="text-right py-2 px-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted">
                    <td className="py-2 px-2">{u.name || "-"}</td>
                    <td className="py-2 px-2">{u.email}</td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs">{u.role}</span>
                    </td>
                    <td className="py-2 px-2">{u.bonusBalance} ₽</td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="secondary">Ред.</Button>
                        <Button size="sm" variant="secondary">Бан</Button>
                        <Button size="sm" variant="secondary">Бонусы</Button>
                        <Button size="sm" variant="destructive">Удалить</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
