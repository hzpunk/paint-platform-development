'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Document = {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
};

export function AdminDocumentsTable({ initialDocuments }: { initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({ title: '', type: '', url: '' });

  async function addDocument() {
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
      if (!res.ok) throw new Error('Ошибка');
      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
      setNewDoc({ title: '', type: '', url: '' });
      toast.success('Документ добавлен');
    } catch {
      toast.error('Не удалось добавить документ');
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm('Удалить документ?')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/documents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Ошибка');
      setDocuments((prev) => prev.filter((item) => item.id !== id));
      toast.success('Документ удалён');
    } catch {
      toast.error('Не удалось удалить документ');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Документы</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление юридическими и внутренними документами.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder="Название"
          value={newDoc.title}
          onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
        />
        <Input
          placeholder="Тип"
          value={newDoc.type}
          onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
        />
        <Input
          placeholder="Ссылка"
          value={newDoc.url}
          onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
        />
        <Button onClick={addDocument}>Добавить</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Тип</th>
              <th className="px-4 py-3">Ссылка</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t border-border">
                <td className="px-4 py-3">{doc.title}</td>
                <td className="px-4 py-3">{doc.type}</td>
                <td className="px-4 py-3">
                  <a href={doc.url} target="_blank" className="text-blue-600 hover:underline">
                    {doc.url}
                  </a>
                </td>
                <td className="px-4 py-3">{new Date(doc.createdAt).toLocaleDateString('ru')}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteDocument(doc.id)}
                    disabled={loadingId === doc.id}
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
