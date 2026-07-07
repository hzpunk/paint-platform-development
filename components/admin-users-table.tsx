"use client";

import { useEffect, useState } from "react";
import { loyaltyTiers } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useToast } from "./toast-provider";
import { useLanguage } from "./language-provider";
import { LoadingSpinner } from "./loading-spinner";
import { Shield, Users, Mail, Phone, Calendar, Trash2 } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
  bonusBalance: number;
  totalSpent: number;
}

const roleLabel: Record<string, string> = {
  admin: "Администратор",
  user: "Пользователь",
};

export default function AdminUsersTable() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load users");
      const data = await response.json();
      setUsers(data || []);
    } catch (error) {
      console.error(error);
      showToast("Не удалось загрузить пользователей", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user: AdminUser) => {
    setActiveId(user.id);
    try {
      const nextRole = user.role === "admin" ? "user" : "admin";
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        },
      );
      if (!response.ok) throw new Error("Failed to update role");
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, role: nextRole } : item,
        ),
      );
      showToast(
        `Роль обновлена: ${roleLabel[nextRole] || nextRole}`,
        "success",
      );
    } catch (error) {
      console.error(error);
      showToast("Ошибка при изменении роли", "error");
    } finally {
      setActiveId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Удалить пользователя?")) return;
    setActiveId(userId);
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      showToast("Пользователь удалён", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка при удалении пользователя", "error");
    } finally {
      setActiveId(null);
    }
  };

  const filtered = users.filter((user) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      user.email.toLowerCase().includes(term) ||
      (user.name || "").toLowerCase().includes(term) ||
      (user.phone || "").includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Пользователи</h1>
          <p className="text-sm text-muted-foreground">
            Список клиентов и администраторов сайта.
          </p>
        </div>
        <div className="max-w-xs flex-1">
          <Input
            placeholder="Поиск по email, имени или телефону"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="text-lg font-semibold">
            Пользователи не найдены
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Измените фильтр или попробуйте позже.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((user) => (
            <Card key={user.id} className="border-border/70">
              <CardHeader className="gap-4 p-6 sm:flex sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {user.name || user.email}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{user.email}</span>
                    <span>•</span>
                    <span>{user.phone || "Телефон не указан"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      user.role === "admin" ? "destructive" : "secondary"
                    }
                  >
                    {roleLabel[user.role] || user.role}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeId === user.id}
                    onClick={() => handleRoleToggle(user)}
                  >
                    {activeId === user.id
                      ? "Сохраняем..."
                      : user.role === "admin"
                        ? "Сделать пользователем"
                        : "Сделать админом"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={activeId === user.id}
                    onClick={() => handleDelete(user.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                <div>
                  Зарегистрирован:{" "}
                  {new Date(user.createdAt).toLocaleString("ru-RU")}
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    Бонусы:{" "}
                    <span className="font-medium">
                      {user.bonusBalance ?? 0}
                    </span>
                  </div>
                  <div>
                    Уровень:{" "}
                    <span className="font-medium">
                      {(() => {
                        const tiers = loyaltyTiers
                          .slice()
                          .sort((a, b) => a.threshold - b.threshold);
                        const tier =
                          [...tiers]
                            .reverse()
                            .find(
                              (t) => (user.totalSpent ?? 0) >= t.threshold,
                            ) ?? tiers[0];
                        return tier.name;
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
