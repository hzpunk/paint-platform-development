'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type FundAllocation = {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  createdAt: string;
};

export function AdminFinanceTable({ initialAllocations }: { initialAllocations: FundAllocation[] }) {
  const [allocations, setAllocations] = useState(initialAllocations);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newAllocation, setNewAllocation] = useState({ name: '', percentage: 0, amount: 0 });

  async function addAllocation() {
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAllocation),
      });
      if (!res.ok) throw new Error('Ошибка');
      const allocation = await res.json();
      setAllocations((prev) => [allocation, ...prev]);
      setNewAllocation({ name: '', percentage: 0, amount: 0 });
      toast.success('Распределение добавлено');
    } catch {
      toast.error('Не удалось добавить распределение');
    }
  }

  async function deleteAllocation(id: string) {
    if (!confirm('Удалить распределение?')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/finance?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Ошибка');
      setAllocations((prev) => prev.filter((item) => item.id !== id));
      toast.success('Распределение удалено');
    } catch {
      toast.error('Не удалось удалить распределение');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Распределение средств</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление распределением прибыли.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder="Название"
          value={newAllocation.name}
          onChange={(e) => setNewAllocation({ ...newAllocation, name: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Процент"
          value={newAllocation.percentage}
          onChange={(e) => setNewAllocation({ ...newAllocation, percentage: Number(e.target.value) })}
        />
        <Input
          type="number"
          placeholder="Сумма"
          value={newAllocation.amount}
          onChange={(e) => setNewAllocation({ ...newAllocation, amount: Number(e.target.value) })}
        />
        <Button onClick={addAllocation}>Добавить</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Процент</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation.id} className="border-t border-border">
                <td className="px-4 py-3">{allocation.name}</td>
                <td className="px-4 py-3">{allocation.percentage}%</td>
                <td className="px-4 py-3">{allocation.amount.toLocaleString('ru')} ₽</td>
                <td className="px-4 py-3">{new Date(allocation.createdAt).toLocaleDateString('ru')}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteAllocation(allocation.id)}
                    disabled={loadingId === allocation.id}
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
