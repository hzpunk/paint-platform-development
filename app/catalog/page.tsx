"use client";

import {
  useState,
  useMemo,
  Suspense,
  useEffect,
  useDeferredValue,
  useRef,
  useLayoutEffect,
} from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProductCard } from "@/components/product/product-card";
import type { PaintType } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "popular", label: "Популярные" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "rating", label: "По рейтингу" },
];

const MAX_PRICE = 15000;

const DEFAULT_CATEGORY_NAMES: Record<string, string> = {
  interior: "Интерьерные краски",
  facade: "Фасадные краски",
  primer: "Грунтовки",
  enamel: "Эмали и лаки",
  anticor: "Антикоррозийные",
  special: "Спецсоставы",
};

const DEFAULT_BRAND_NAMES: Record<string, string> = {
  tikkurila: "Tikkurila",
  dulux: "Dulux",
  caparol: "Caparol",
  tex: "ТЕКС",
  lakra: "Lakra",
  olki: "Ольки",
};

const DEFAULT_SURFACES = [
  "Стены",
  "Потолок",
  "Дерево",
  "Металл",
  "Бетон",
  "Кирпич",
  "Штукатурка",
];
const DEFAULT_PAINT_TYPES: PaintType[] = [
  "водоэмульсионная",
  "алкидная",
  "акриловая",
  "эпоксидная",
];

function CatalogContent() {
  const params = useSearchParams();
  const initCategory = params.get("category") ?? "";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initCategory ? [initCategory] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<PaintType[]>([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const deferredSearchInput = useDeferredValue(searchInput);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    MAX_PRICE,
  ]);
  const [sort, setSort] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openFilterGroup, setOpenFilterGroup] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<
    { slug: string; name: string }[]
  >([]);
  const [brands, setBrands] = useState<{ slug: string; name: string }[]>([]);
  const [surfaces, setSurfaces] = useState<string[]>([]);
  const [paintTypes, setPaintTypes] = useState<string[]>([]);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([
    0,
    MAX_PRICE,
  ]);
  const [loading, setLoading] = useState(true);

  // sync category parameter changes from URL/footer click
  useEffect(() => {
    setSelectedCategories(initCategory ? [initCategory] : []);
  }, [initCategory]);

  // Загрузка продуктов и источников значений фильтров с API
  useEffect(() => {
    let mounted = true;

    async function loadFilters() {
      setLoading(true);
      try {
        const [
          productsRes,
          categoriesRes,
          brandsRes,
          surfacesRes,
          paintTypesRes,
        ] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
          fetch("/api/admin/brands"),
          fetch("/api/admin/dictionaries?type=surfaces"),
          fetch("/api/admin/dictionaries?type=paintTypes"),
        ]);

        const productsData = productsRes.ok
          ? await productsRes.json()
          : { products: [] };
        const categoriesData = categoriesRes.ok
          ? await categoriesRes.json()
          : [];
        const brandsData = brandsRes.ok ? await brandsRes.json() : [];
        const surfacesData = surfacesRes.ok ? await surfacesRes.json() : [];
        const paintTypesData = paintTypesRes.ok
          ? await paintTypesRes.json()
          : [];

        if (!mounted) return;

        const loadedProducts = Array.isArray(productsData.products)
          ? productsData.products
          : [];

        const extractNames = (items: unknown[]) =>
          items
            .map((item) =>
              typeof item === "string"
                ? item
                : item && typeof item === "object"
                  ? (item as any).name || (item as any).slug || ""
                  : "",
            )
            .filter(
              (name) => typeof name === "string" && name.trim(),
            ) as string[];

        const parsedSurfaces = Array.isArray(surfacesData)
          ? extractNames(surfacesData)
          : [];
        const parsedPaintTypes = Array.isArray(paintTypesData)
          ? extractNames(paintTypesData)
          : [];

        const prices = loadedProducts
          .map((product) => Number(product.price))
          .filter((price) => Number.isFinite(price));

        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : MAX_PRICE;

        setProducts(loadedProducts);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setSurfaces(parsedSurfaces.length ? parsedSurfaces : DEFAULT_SURFACES);
        setPaintTypes(
          parsedPaintTypes.length ? parsedPaintTypes : DEFAULT_PAINT_TYPES,
        );
        setPriceBounds([minPrice, maxPrice]);
        setPriceRange([minPrice, maxPrice]);
      } catch (error) {
        console.error("Ошибка при загрузке каталога:", error);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadFilters();

    return () => {
      mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!searchFocused || !searchInputRef.current) return;

    const input = searchInputRef.current;
    const caret = input.value.length;

    if (document.activeElement !== input) {
      input.focus();
      input.setSelectionRange(caret, caret);
    }
  }, [
    searchFocused,
    deferredSearchInput,
    priceRange,
    selectedCategories,
    selectedBrands,
    selectedSurfaces,
    selectedTypes,
    onlyInStock,
    sort,
  ]);

  function toggle<T>(arr: T[], item: T, set: (v: T[]) => void) {
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  }

  function toggleFilterGroup(group: string) {
    setOpenFilterGroup((value) => (value === group ? null : group));
  }

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length)
      result = result.filter((p) =>
        selectedCategories.includes(p.category.slug),
      );
    if (selectedBrands.length)
      result = result.filter((p) => selectedBrands.includes(p.brand.slug));
    if (selectedSurfaces.length)
      result = result.filter((p) =>
        selectedSurfaces.some((s) => p.surfaces.includes(s)),
      );
    if (selectedTypes.length)
      result = result.filter((p) => selectedTypes.includes(p.type));
    if (onlyInStock) result = result.filter((p) => p.stock > 0);

    const normalizedQuery = deferredSearchInput.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((p) => {
        const haystack = [
          p.name,
          p.description,
          p.brand?.name,
          p.brand?.slug,
          p.category?.name,
          p.category?.slug,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      });
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [
    products,
    selectedCategories,
    selectedBrands,
    selectedSurfaces,
    selectedTypes,
    priceRange,
    onlyInStock,
    deferredSearchInput,
    sort,
  ]);

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedSurfaces.length > 0 ||
    selectedTypes.length > 0 ||
    onlyInStock ||
    priceRange[0] > 0 ||
    priceRange[1] < MAX_PRICE ||
    searchInput.trim().length > 0;

  function resetFilters() {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSurfaces([]);
    setSelectedTypes([]);
    setPriceRange([0, MAX_PRICE]);
    setOnlyInStock(false);
    setSearchInput("");
    setOpenFilterGroup(null);
  }

  const categoryOptions =
    categories.length > 0
      ? categories
      : Object.entries(DEFAULT_CATEGORY_NAMES).map(([slug, name]) => ({
          slug,
          name,
        }));

  const brandOptions =
    brands.length > 0
      ? brands
      : Object.entries(DEFAULT_BRAND_NAMES).map(([slug, name]) => ({
          slug,
          name,
        }));

  const categoryLabelMap = Object.fromEntries(
    categoryOptions.map((item) => [item.slug, item.name]),
  );

  const brandLabelMap = Object.fromEntries(
    brandOptions.map((item) => [item.slug, item.name]),
  );

  const surfaceOptions = surfaces.length > 0 ? surfaces : DEFAULT_SURFACES;
  const paintTypeOptions =
    paintTypes.length > 0 ? paintTypes : DEFAULT_PAINT_TYPES;

  const Filters = () => (
    <aside className="flex flex-col gap-3">
      <div className="rounded-lg border bg-card/60 p-3">
        <Label
          htmlFor="catalog-search"
          className="mb-2 block text-sm font-semibold"
        >
          Поиск по каталогу
        </Label>
        <Input
          ref={searchInputRef}
          id="catalog-search"
          placeholder="Введите название или бренд"
          value={searchInput}
          autoComplete="off"
          inputMode="search"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Категория */}
      <FilterGroup
        title="Категория"
        open={openFilterGroup === "category"}
        onToggle={() => toggleFilterGroup("category")}
      >
        {categoryOptions.map(({ slug, name }) => (
          <CheckItem
            key={slug}
            id={`cat-${slug}`}
            label={name}
            checked={selectedCategories.includes(slug)}
            onChange={() =>
              toggle(selectedCategories, slug, setSelectedCategories)
            }
          />
        ))}
      </FilterGroup>

      {/* Бренд */}
      <FilterGroup
        title="Бренд"
        open={openFilterGroup === "brand"}
        onToggle={() => toggleFilterGroup("brand")}
      >
        {brandOptions.map(({ slug, name }) => (
          <CheckItem
            key={slug}
            id={`brand-${slug}`}
            label={name}
            checked={selectedBrands.includes(slug)}
            onChange={() => toggle(selectedBrands, slug, setSelectedBrands)}
          />
        ))}
      </FilterGroup>

      {/* Поверхность */}
      <FilterGroup
        title="Поверхность"
        open={openFilterGroup === "surface"}
        onToggle={() => toggleFilterGroup("surface")}
      >
        {surfaceOptions.map((s) => (
          <CheckItem
            key={s}
            id={`surf-${s}`}
            label={s}
            checked={selectedSurfaces.includes(s)}
            onChange={() => toggle(selectedSurfaces, s, setSelectedSurfaces)}
          />
        ))}
      </FilterGroup>

      {/* Тип */}
      <FilterGroup
        title="Тип краски"
        open={openFilterGroup === "type"}
        onToggle={() => toggleFilterGroup("type")}
      >
        {paintTypeOptions.map((t) => (
          <CheckItem
            key={t}
            id={`type-${t}`}
            label={t.charAt(0).toUpperCase() + t.slice(1)}
            checked={selectedTypes.includes(t)}
            onChange={() => toggle(selectedTypes, t, setSelectedTypes)}
          />
        ))}
      </FilterGroup>

      {/* Цена */}
      <FilterGroup
        title="Цена"
        open={openFilterGroup === "price"}
        onToggle={() => toggleFilterGroup("price")}
      >
        <div className="space-y-3 rounded-md border bg-background/70 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>От {priceRange[0].toLocaleString("ru")} ₽</span>
            <span>До {priceRange[1].toLocaleString("ru")} ₽</span>
          </div>
          <Slider
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={100}
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            className="py-3 touch-pan-y"
          />
        </div>
      </FilterGroup>

      {/* В наличии */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="instock"
          checked={onlyInStock}
          onCheckedChange={(v) => setOnlyInStock(Boolean(v))}
        />
        <Label htmlFor="instock" className="cursor-pointer text-sm">
          Только в наличии
        </Label>
      </div>

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <X className="mr-2 size-4" /> Сбросить фильтры
        </Button>
      )}
    </aside>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold md:text-3xl">
            Каталог красок и ЛКМ
          </h1>
          <p className="mt-1 text-muted-foreground">Загрузка...</p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          Каталог красок и ЛКМ
        </h1>
        <p className="mt-1 text-muted-foreground">
          {filtered.length} товаров
          {hasFilters ? " (с фильтрами)" : ""}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Сайдбар Desktop */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-4">
            <Filters />
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Тулбар */}
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            {/* Мобильные фильтры */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden gap-2"
                  >
                    <SlidersHorizontal className="size-4" />
                    Фильтры
                    {hasFilters && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                        !
                      </span>
                    )}
                  </Button>
                }
              />
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-heading">Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-4 px-4">
                  <Filters />
                </div>
              </SheetContent>
            </Sheet>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Сортировка:
              </span>
              <div className="flex gap-1 flex-wrap">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      sort === o.value
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Чипы активных фильтров */}
          {hasFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {selectedCategories.map((slug) => (
                <FilterChip
                  key={`c-${slug}`}
                  label={CATEGORY_NAMES[slug] ?? slug}
                  onRemove={() =>
                    toggle(selectedCategories, slug, setSelectedCategories)
                  }
                />
              ))}
              {selectedBrands.map((slug) => (
                <FilterChip
                  key={`b-${slug}`}
                  label={DEFAULT_BRAND_NAMES[slug] ?? slug}
                  onRemove={() =>
                    toggle(selectedBrands, slug, setSelectedBrands)
                  }
                />
              ))}
              {selectedSurfaces.map((s) => (
                <FilterChip
                  key={`s-${s}`}
                  label={s}
                  onRemove={() =>
                    toggle(selectedSurfaces, s, setSelectedSurfaces)
                  }
                />
              ))}
              {selectedTypes.map((t) => (
                <FilterChip
                  key={`t-${t}`}
                  label={t.charAt(0).toUpperCase() + t.slice(1)}
                  onRemove={() => toggle(selectedTypes, t, setSelectedTypes)}
                />
              ))}
              {onlyInStock && (
                <FilterChip
                  label="Только в наличии"
                  onRemove={() => setOnlyInStock(false)}
                />
              )}
              {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
                <FilterChip
                  label={`${priceRange[0].toLocaleString("ru")} — ${priceRange[1].toLocaleString("ru")} ₽`}
                  onRemove={() => setPriceRange([0, MAX_PRICE])}
                />
              )}
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Очистить всё
              </button>
            </div>
          )}

          {/* Сетка товаров */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-lg font-medium">Ничего не найдено</p>
              <p className="text-muted-foreground">
                Попробуйте сбросить фильтры
              </p>
              <Button onClick={resetFilters}>Сбросить</Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
          Загрузка каталога...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

/* ——— Вспомогательные компоненты ——— */

function FilterGroup({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card/60 p-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="mt-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Убрать фильтр ${label}`}
        className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

function CheckItem({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}
