'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Определяем тип для продукта, чтобы использовать его в компоненте
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: { name: string };
  brand: { name: string };
};

export function AdminProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Функция для удаления продукта
  async function deleteProduct(id: string) {
    if (!confirm('Удалить продукт? Это действие необратимо.')) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Ошибка');

      setProducts((prev) => prev.filter((item) => item.id !== id));
      toast.success('Продукт удалён');
    } catch {
      toast.error('Не удалось удалить продукт');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Продукты</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление продуктами в каталоге.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3">Бренд</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Остаток</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{product.name}</td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3">{product.brand.name}</td>
                <td className="px-4 py-3">{product.price.toLocaleString('ru')} ₽</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3 space-x-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProduct(product.id)}
                    disabled={loadingId === product.id}
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
