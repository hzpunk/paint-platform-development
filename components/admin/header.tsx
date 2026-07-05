import React from "react";

export function AdminHeader({ title }: { title?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
      <h2 className="text-lg font-semibold">{title ?? "Админ"}</h2>
      <div className="text-sm text-muted-foreground">
        Панель управления — рабочий режим
      </div>
    </header>
  );
}
