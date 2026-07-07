"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./toast-provider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const sections = [
  { key: "brands", label: "Бренды", endpoint: "/api/admin/brands" },
  { key: "categories", label: "Категории", endpoint: "/api/admin/categories" },
  {
    key: "surfaces",
    label: "Поверхности",
    endpoint: "/api/admin/dictionaries?type=surfaces",
  },
  {
    key: "paintTypes",
    label: "Типы краски",
    endpoint: "/api/admin/dictionaries?type=paintTypes",
  },
] as const;

type Item = { id: string; name: string; slug?: string };

export default function AdminDictionaryManager() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Record<string, Item[]>>({
    brands: [],
    categories: [],
    surfaces: [],
    paintTypes: [],
  });
  const [activeKey, setActiveKey] =
    useState<(typeof sections)[number]["key"]>("brands");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeSection = sections.find((section) => section.key === activeKey)!;

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const requests = sections.map(async (section) => {
        const res = await fetch(section.endpoint, { credentials: "include" });
        if (!res.ok) return [];
        return res.json();
      });
      const results = await Promise.all(requests);
      const next: Record<string, Item[]> = {
        brands: [],
        categories: [],
        surfaces: [],
        paintTypes: [],
      };
      sections.forEach((section, index) => {
        next[section.key] = results[index] as Item[];
      });
      setItems(next);
    } catch (error) {
      console.error(error);
      showToast("Не удалось загрузить справочники", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      showToast("Введите название", "error");
      return;
    }

    setLoading(true);
    try {
      if (activeKey === "brands" || activeKey === "categories") {
        const res = await fetch(activeSection.endpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug: undefined }),
        });
        if (!res.ok) throw new Error("Failed");
        const created = await res.json();
        setItems((prev) => ({
          ...prev,
          [activeKey]: [...prev[activeKey], created],
        }));
      } else {
        const res = await fetch(activeSection.endpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug: undefined, type: activeKey }),
        });
        if (!res.ok) throw new Error("Failed");
        const created = await res.json();
        setItems((prev) => ({
          ...prev,
          [activeKey]: [...prev[activeKey], created],
        }));
      }

      setName("");
      setDialogOpen(false);
      showToast("Сохранено", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка создания", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить элемент?")) return;

    try {
      if (activeKey === "brands" || activeKey === "categories") {
        const res = await fetch(`${activeSection.endpoint}/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed");
      } else {
        const res = await fetch(activeSection.endpoint, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, type: activeKey }),
        });
        if (!res.ok) throw new Error("Failed");
      }
      setItems((prev) => ({
        ...prev,
        [activeKey]: prev[activeKey].filter((item) => item.id !== id),
      }));
      showToast("Удалено", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка удаления", "error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Справочники каталога</p>
          <h2 className="text-2xl font-semibold">
            Бренды, категории, поверхности и типы краски
          </h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">Разделы</p>
          <div className="mt-3 space-y-2">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveKey(section.key)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${activeKey === section.key ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-transparent text-foreground hover:border-primary/40"}`}
              >
                <span>{section.label}</span>
                <span className="text-xs text-muted-foreground">
                  {items[section.key].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{activeSection.label}</p>
              <p className="text-sm text-muted-foreground">
                Создавайте новые значения без ручного slug.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button type="button" size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Добавить {activeSection.label.toLowerCase()}
                  </DialogTitle>
                </DialogHeader>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Название</span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`Введите ${activeSection.label.toLowerCase()}`}
                  />
                </label>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button onClick={handleCreate} disabled={loading}>
                    {loading ? "Сохраняю..." : "Создать"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 space-y-3">
            {items[activeKey].length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                Пока нет элементов в этом справочнике.
              </div>
            ) : (
              items[activeKey].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.slug ? (
                      <p className="text-sm text-muted-foreground">
                        {item.slug}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Удалить
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
