"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Customer = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  bonusBalance?: number | null;
  totalSpent?: number | null;
  createdAt: string;
};

export function AdminCustomersTable({
  initialCustomers,
}: {
  initialCustomers: Customer[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateRole(id: string, role: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Ошибка");
      const updated = await res.json();
      setCustomers((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, role: updated.role } : item,
        ),
      );
      toast.success("Роль обновлена");
    } catch {
      toast.error("Не удалось обновить роль");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteCustomer(id: string) {
    if (!confirm("Удалить клиента? Это действие необратимо.")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Ошибка");
      setCustomers((prev) => prev.filter((item) => item.id !== id));
      toast.success("Клиент удалён");
    } catch {
      toast.error("Не удалось удалить клиента");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Клиенты</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление зарегистрированными пользователями и их ролями.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Баллы</th>
              <th className="px-4 py-3">Потрачено</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-semibold">
                    {customer.name || "Без имени"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {customer.email}
                  </div>
                </td>
                <td className="px-4 py-3">{customer.role}</td>
                <td className="px-4 py-3">
                  {(customer.bonusBalance ?? 0).toLocaleString("ru")}
                </td>
                <td className="px-4 py-3">
                  {(customer.totalSpent ?? 0).toLocaleString("ru")} ₽
                </td>
                <td className="px-4 py-3">{customer.createdAt}</td>
                <td className="px-4 py-3 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateRole(
                        customer.id,
                        customer.role === "admin" ? "user" : "admin",
                      )
                    }
                    disabled={loadingId === customer.id}
                  >
                    {customer.role === "admin"
                      ? "Снять admin"
                      : "Сделать admin"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCustomer(customer.id)}
                    disabled={loadingId === customer.id}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
