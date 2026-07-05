'use client'

import { useState, useMemo, Suspense, useEffect } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ProductCard } from '@/components/product/product-card'
import type { PaintType } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Популярные' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
  { value: 'rating', label: 'По рейтингу' },
]

const MAX_PRICE = 15000

function CatalogContent() {
  const params = useSearchParams()
  const initCategory = params.get('category') ?? ''

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initCategory ? [initCategory] : [],
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<PaintType[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE])
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sort, setSort] = useState('popular')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка продуктов с API
  useEffect(() => {
    let mounted = true

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setProducts([])
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  function toggle<T>(arr: T[], item: T, set: (v: T[]) => void) {
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item])
  }

  const filtered = useMemo(() => {
    let result = [...products]

    if (selectedCategories.length)
      result = result.filter((p) => selectedCategories.includes(p.category.slug))
    if (selectedBrands.length)
      result = result.filter((p) => selectedBrands.includes(p.brand.slug))
    if (selectedSurfaces.length)
      result = result.filter((p) => selectedSurfaces.some((s) => p.surfaces.includes(s)))
    if (selectedTypes.length)
      result = result.filter((p) => selectedTypes.includes(p.type))
    if (onlyInStock)
      result = result.filter((p) => p.stock > 0)

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break
      case 'price_desc': result.sort((a, b) => b.price - a.price); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      default: result.sort((a, b) => b.reviewsCount - a.reviewsCount)
    }

    return result
  }, [products, selectedCategories, selectedBrands, selectedSurfaces, selectedTypes, priceRange, onlyInStock, sort])

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedSurfaces.length > 0 ||
    selectedTypes.length > 0 ||
    onlyInStock ||
    priceRange[0] > 0 ||
    priceRange[1] < MAX_PRICE

  function resetFilters() {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedSurfaces([])
    setSelectedTypes([])
    setPriceRange([0, MAX_PRICE])
    setOnlyInStock(false)
  }

  const Filters = () => (
    <aside className="flex flex-col gap-6">
      {/* Категория */}
      <FilterGroup title="Категория">
        {['interior', 'facade', 'primer', 'enamel', 'anticor', 'special'].map((slug) => {
          const names = {
            interior: 'Интерьерные краски',
            facade: 'Фасадные краски',
            primer: 'Грунтовки',
            enamel: 'Эмали и лаки',
            anticor: 'Антикоррозийные',
            special: 'Спецсоставы'
          }
          return (
            <CheckItem
              key={slug}
              id={`cat-${slug}`}
              label={names[slug as keyof typeof names]}
              checked={selectedCategories.includes(slug)}
              onChange={() => toggle(selectedCategories, slug, setSelectedCategories)}
            />
          )
        })}
      </FilterGroup>

      {/* Бренд */}
      <FilterGroup title="Бренд">
        {['tikkurila', 'dulux', 'caparol', 'tex', 'lakra', 'olki'].map((slug) => {
          const names = {
            tikkurila: 'Tikkurila',
            dulux: 'Dulux',
            caparol: 'Caparol',
            tex: 'ТЕКС',
            lakra: 'Lakra',
            olki: 'Ольки'
          }
          return (
            <CheckItem
              key={slug}
              id={`brand-${slug}`}
              label={names[slug as keyof typeof names]}
              checked={selectedBrands.includes(slug)}
              onChange={() => toggle(selectedBrands, slug, setSelectedBrands)}
            />
          )
        })}
      </FilterGroup>

      {/* Поверхность */}
      <FilterGroup title="Поверхность">
        {['Стены', 'Потолок', 'Дерево', 'Металл', 'Бетон', 'Кирпич', 'Штукатурка'].map((s) => (
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
      <FilterGroup title="Тип краски">
        {['водоэмульсионная', 'алкидная', 'акриловая', 'эпоксидная'].map((t) => (
          <CheckItem
            key={t}
            id={`type-${t}`}
            label={t.charAt(0).toUpperCase() + t.slice(1)}
            checked={selectedTypes.includes(t as PaintType)}
            onChange={() => toggle(selectedTypes, t as PaintType, setSelectedTypes)}
          />
        ))}
      </FilterGroup>

      {/* Цена */}
      <FilterGroup title={`Цена: ${priceRange[0].toLocaleString('ru')} — ${priceRange[1].toLocaleString('ru')} ₽`}>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={100}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mt-1"
        />
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
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold md:text-3xl">Каталог красок и ЛКМ</h1>
          <p className="mt-1 text-muted-foreground">Загрузка...</p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">Каталог красок и ЛКМ</h1>
        <p className="mt-1 text-muted-foreground">
          {filtered.length} товаров
          {hasFilters ? ' (с фильтрами)' : ''}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Сайдбар Desktop */}
        <div className="hidden w-60 shrink-0 lg:block">
          <Filters />
        </div>

        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Тулбар */}
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            {/* Мобильные фильтры */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="lg:hidden gap-2">
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
              <span className="text-sm text-muted-foreground hidden sm:block">Сортировка:</span>
              <div className="flex gap-1 flex-wrap">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm transition-colors',
                      sort === o.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground',
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Сетка товаров */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-lg font-medium">Ничего не найдено</p>
              <p className="text-muted-foreground">Попробуйте сбросить фильтры</p>
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
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">Загрузка каталога...</div>}>
      <CatalogContent />
    </Suspense>
  )
}

/* ——— Вспомогательные компоненты ——— */

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function CheckItem({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  )
}