"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [draft, setDraft] = useState<Partial<Customer>>({});

  function openEditor(customer: Customer) {
    setEditingCustomer(customer);
    setDraft({
      name: customer.name ?? "",
      email: customer.email,
      role: customer.role,
      bonusBalance: customer.bonusBalance ?? 0,
      totalSpent: customer.totalSpent ?? 0,
    });
  }

  async function saveCustomer() {
    if (!editingCustomer) return;
    setLoadingId(editingCustomer.id);
    try {
      const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          email: draft.email,
          role: draft.role,
          bonusBalance: Number(draft.bonusBalance ?? 0),
          totalSpent: Number(draft.totalSpent ?? 0),
        }),
      });
      if (!res.ok) throw new Error("Ошибка");
      const updated = await res.json();
      setCustomers((prev) => prev.map((item) => (item.id === editingCustomer.id ? { ...item, ...updated } : item)));
      setEditingCustomer(null);
      toast.success("Клиент обновлён");
    } catch {
      toast.error("Не удалось обновить клиента");
    } finally {
      setLoadingId(null);
    }
  }

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
      <Dialog open={Boolean(editingCustomer)} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Редактировать клиента</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Имя</Label>
              <Input id="customer-name" value={draft.name ?? ""} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" value={draft.email ?? ""} onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="customer-role">Роль</Label>
              <Input id="customer-role" value={draft.role ?? "user"} onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer-bonus">Баллы</Label>
                <Input id="customer-bonus" type="number" value={draft.bonusBalance ?? 0} onChange={(e) => setDraft((prev) => ({ ...prev, bonusBalance: Number(e.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="customer-spent">Потрачено</Label>
                <Input id="customer-spent" type="number" value={draft.totalSpent ?? 0} onChange={(e) => setDraft((prev) => ({ ...prev, totalSpent: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCustomer(null)}>Отмена</Button>
            <Button onClick={saveCustomer} disabled={loadingId === editingCustomer?.id}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                    onClick={() => openEditor(customer)}
                    disabled={loadingId === customer.id}
                  >
                    Редактировать
                  </Button>
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
