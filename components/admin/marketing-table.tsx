'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type MarketingMetric = {
  id: string;
  platform: string;
  views: number;
  likes: number;
  followers: number;
  date: string;
};

export function AdminMarketingTable({ initialMetrics }: { initialMetrics: MarketingMetric[] }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState({
    platform: '',
    views: 0,
    likes: 0,
    followers: 0,
    date: new Date().toISOString().slice(0, 10),
  });

  async function addMetric() {
    try {
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetric),
      });
      if (!res.ok) throw new Error('Ошибка');
      const metric = await res.json();
      setMetrics((prev) => [metric, ...prev]);
      setNewMetric({ platform: '', views: 0, likes: 0, followers: 0, date: new Date().toISOString().slice(0, 10) });
      toast.success('Метрика добавлена');
    } catch {
      toast.error('Не удалось добавить метрику');
    }
  }

  async function deleteMetric(id: string) {
    if (!confirm('Удалить метрику?')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/marketing?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Ошибка');
      setMetrics((prev) => prev.filter((item) => item.id !== id));
      toast.success('Метрика удалена');
    } catch {
      toast.error('Не удалось удалить метрику');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Метрики маркетинга</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление показателями платформ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <Input
          placeholder="Платформа"
          value={newMetric.platform}
          onChange={(e) => setNewMetric({ ...newMetric, platform: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Просмотры"
          value={newMetric.views}
          onChange={(e) => setNewMetric({ ...newMetric, views: Number(e.target.value) })}
        />
        <Input
          type="number"
          placeholder="Лайки"
          value={newMetric.likes}
          onChange={(e) => setNewMetric({ ...newMetric, likes: Number(e.target.value) })}
        />
        <Input
          type="number"
          placeholder="Подписчики"
          value={newMetric.followers}
          onChange={(e) => setNewMetric({ ...newMetric, followers: Number(e.target.value) })}
        />
        <Input
          type="date"
          value={newMetric.date}
          onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
        />
        <Button onClick={addMetric}>Добавить</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Платформа</th>
              <th className="px-4 py-3">Просмотры</th>
              <th className="px-4 py-3">Лайки</th>
              <th className="px-4 py-3">Подписчики</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id} className="border-t border-border">
                <td className="px-4 py-3">{metric.platform}</td>
                <td className="px-4 py-3">{metric.views}</td>
                <td className="px-4 py-3">{metric.likes}</td>
                <td className="px-4 py-3">{metric.followers}</td>
                <td className="px-4 py-3">{new Date(metric.date).toLocaleDateString('ru')}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMetric(metric.id)}
                    disabled={loadingId === metric.id}
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
