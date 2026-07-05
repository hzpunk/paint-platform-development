import { UsersTable } from "@/components/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Пользователи</h2>
        <p className="text-muted-foreground">Поиск, фильтры, роли, бонусы и управление доступом.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Операции с пользователями</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>• Удаление и редактирование профиля</p>
          <p>• Бан и изменение роли</p>
          <p>• Выдача бонусов и управление доступом</p>
          <p>• Поиск по пользователям и фильтрация по ролям</p>
        </CardContent>
      </Card>

      <UsersTable />
    </div>
  );
}
