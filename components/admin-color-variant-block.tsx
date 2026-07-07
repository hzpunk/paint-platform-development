"use client";

import { Button } from "./ui/button";

export type ColorEntry = {
  hex: string;
  name: string;
  stock: string;
};

interface AdminColorVariantBlockProps {
  colorEntries: ColorEntry[];
  onChange: (entries: ColorEntry[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function AdminColorVariantBlock({
  colorEntries,
  onChange,
  onAdd,
  onRemove,
}: AdminColorVariantBlockProps) {
  const updateColorHex = (idx: number, val: string) => {
    let formattedVal = val.trim();
    if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(formattedVal)) {
      formattedVal = `#${formattedVal}`;
    }
    onChange(
      colorEntries.map((entry, index) =>
        index === idx ? { ...entry, hex: formattedVal } : entry,
      ),
    );
  };

  const updateColorName = (idx: number, val: string) => {
    onChange(
      colorEntries.map((entry, index) =>
        index === idx ? { ...entry, name: val } : entry,
      ),
    );
  };

  const updateColorStock = (idx: number, val: string) => {
    onChange(
      colorEntries.map((entry, index) =>
        index === idx ? { ...entry, stock: val } : entry,
      ),
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onAdd}>
          Добавить цвет
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {colorEntries.map((entry, index) => {
          const isValidHex7 = /^#[0-9A-Fa-f]{6}$/.test(entry.hex);
          const colorPickerValue = isValidHex7 ? entry.hex : "#ffffff";
          
          return (
            <div
              key={`color-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2"
            >
              <div
                className="relative h-8 w-8 rounded-full border overflow-hidden shrink-0"
                style={{ backgroundColor: entry.hex || "transparent" }}
              >
                <input
                  type="color"
                  value={colorPickerValue}
                  onChange={(event) => updateColorHex(index, event.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-none"
                />
              </div>
              <input
                value={entry.hex}
                onChange={(event) => updateColorHex(index, event.target.value)}
                placeholder="#ffffff"
                className="h-8 w-28 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors placeholder:text-muted-foreground md:text-sm"
              />
              <input
                value={entry.name}
                onChange={(event) => updateColorName(index, event.target.value)}
                placeholder="Название цвета"
                className="h-8 w-44 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors placeholder:text-muted-foreground md:text-sm"
              />
              <input
                type="number"
                min="0"
                value={entry.stock}
                onChange={(event) => updateColorStock(index, event.target.value)}
                placeholder="шт"
                className="h-8 w-24 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors placeholder:text-muted-foreground md:text-sm"
              />
              <button
                type="button"
                className="text-xs text-muted-foreground"
                onClick={() => onRemove(index)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
