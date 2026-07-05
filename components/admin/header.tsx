import React from "react";
import { Bell, Search } from "lucide-react";

export function AdminHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/90 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title ?? "Операционный центр"}</p>
        <h2 className="text-lg font-semibold">{title ?? "Админ-панель"}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search className="size-4" />
          <span>Поиск по разделам</span>
        </div>
        <button className="rounded-full border border-border/70 bg-background p-2 text-muted-foreground">
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  );
}
