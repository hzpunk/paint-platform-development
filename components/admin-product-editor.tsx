"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { useToast } from "./toast-provider";
import { HZCOMPANY_COMMISSION_RATE } from "@/lib/productPricing";
import {
  AdminColorVariantBlock,
  type ColorEntry,
} from "./admin-color-variant-block";

interface Props {
  productId?: string;
}

function FieldHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const tipRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !tipRef.current || !wrapperRef.current) return;
    const tipRect = tipRef.current.getBoundingClientRect();
    const pad = 8;
    if (tipRect.right > window.innerWidth - pad) {
      setAlignRight(true);
    } else {
      setAlignRight(false);
    }
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        aria-label="Пояснение"
      >
        ?
      </button>
      {open && (
        <div
          ref={tipRef}
          className={`absolute top-7 z-10 w-64 rounded-lg border border-border/60 bg-card p-2 text-xs text-muted-foreground shadow-sm ${
            alignRight ? "right-0 left-auto" : "left-0"
          }`}
        >
          {text}
        </div>
      )}
    </div>
  );
}

type LookupItem = {
  id: string;
  name: string;
  slug?: string;
};

export default function AdminProductEditor({ productId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [volume, setVolume] = useState<number | "">(1);
  const [shortSpec, setShortSpec] = useState("");
  const [description, setDescription] = useState("");
  const [application, setApplication] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState("");
  const [composition, setComposition] = useState("");
  const [consumption, setConsumption] = useState<number | "">("");
  const [dryingTime, setDryingTime] = useState("");
  const [coverage, setCoverage] = useState("");
  const [colorEntries, setColorEntries] = useState<ColorEntry[]>([]);
  const [surfaces, setSurfaces] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState("");
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [brands, setBrands] = useState<LookupItem[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [typeValue, setTypeValue] = useState("");
  const [surfaceOptions, setSurfaceOptions] = useState<string[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [newSurface, setNewSurface] = useState("");
  const [newPaintType, setNewPaintType] = useState("");
  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [dictModalType, setDictModalType] = useState<
    "surfaces" | "paintTypes" | "category" | "brand" | null
  >(null);
  const [dictModalValue, setDictModalValue] = useState("");
  const [dictModalSlug, setDictModalSlug] = useState("");
  const [openCategory, setOpenCategory] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openSurfaces, setOpenSurfaces] = useState(false);
  const [openType, setOpenType] = useState(false);

  const categoryRef = React.useRef<HTMLDivElement | null>(null);
  const brandRef = React.useRef<HTMLDivElement | null>(null);
  const surfacesRef = React.useRef<HTMLDivElement | null>(null);
  const typeRef = React.useRef<HTMLDivElement | null>(null);
  const loadedProductIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const el = e.target as Node;
      if (categoryRef.current && !categoryRef.current.contains(el))
        setOpenCategory(false);
      if (brandRef.current && !brandRef.current.contains(el))
        setOpenBrand(false);
      if (surfacesRef.current && !surfacesRef.current.contains(el))
        setOpenSurfaces(false);
      if (typeRef.current && !typeRef.current.contains(el)) setOpenType(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const previewImage = useMemo(
    () => primaryImage || imageUrls[0] || "/placeholder.svg",
    [primaryImage, imageUrls],
  );
  const numericPrice = typeof price === "number" ? price : Number(price || 0);
  const derivedStock = useMemo(() => {
    return colorEntries.reduce((sum, entry) => {
      const parsed = Number(entry.stock);
      return sum + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);
  }, [colorEntries]);
  const normalizedColors = useMemo(
    () =>
      colorEntries
        .map((entry) => {
          const hex = entry.hex.trim();
          if (!hex) return null;
          const stockValue = Number(entry.stock);
          const colorName = entry.name.trim();
          return {
            hex,
            name: colorName || hex,
            ...(Number.isFinite(stockValue) && stockValue >= 0
              ? { stock: stockValue }
              : {}),
          };
        })
        .filter(Boolean),
    [colorEntries],
  );
  const looksLikePaintProduct = useMemo(() => {
    const haystack = `${name} ${typeValue} ${shortSpec}`.toLowerCase();
    return /(краска|эмаль|лак|водоэмульсион|paint|emulsion|lacquer)/i.test(
      haystack,
    );
  }, [name, typeValue, shortSpec]);
  const commissionAmount =
    numericPrice > 0 ? Math.round(numericPrice * HZCOMPANY_COMMISSION_RATE) : 0;
  const finalPriceWithCommission =
    numericPrice > 0 ? numericPrice + commissionAmount : 0;
  const selectedCategoryName =
    categories.find((c) => c.id === categoryId)?.name || "Каталог";
  const generatedBreadcrumbs = useMemo(() => {
    const parts = ["Главная", "Каталог", selectedCategoryName, name].filter(
      Boolean,
    );
    return parts.join(" / ");
  }, [selectedCategoryName, name]);

  useEffect(() => {
    if (!productId || loadedProductIdRef.current === productId) return;

    loadedProductIdRef.current = productId;
    setLoading(true);
    fetch(`/api/admin/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || "");
        setSlug(data.slug || "");
        setSku(data.sku || data.slug || "");
        setPrice(
          data.price !== undefined && data.price !== null
            ? Number(data.price)
            : "",
        );
        setShortSpec(data.shortSpec || "");
        setDescription(data.description || "");
        setApplication(data.application || "");
        setBreadcrumbs((data.breadcrumbs || []).join(", "));
        setComposition(data.specs?.composition || "");
        const rawCons = data.specs?.consumption;
        setConsumption(
          rawCons === undefined || rawCons === null ? "" : Number(rawCons),
        );
        setDryingTime(data.specs?.dryingTime || "");
        setCoverage(data.specs?.coverage || "");
        setColorEntries(
          Array.isArray(data.colors)
            ? data.colors.map((item: any) => {
                if (typeof item === "string") {
                  return { hex: item, name: item, stock: "" };
                }

                const hex = typeof item?.hex === "string" ? item.hex : "";
                const name = typeof item?.name === "string" ? item.name : "";
                const stockValue =
                  typeof item?.stock === "number"
                    ? item.stock
                    : typeof item?.stock === "string"
                      ? item.stock
                      : "";

                return {
                  hex,
                  name,
                  stock:
                    stockValue === "" || stockValue === null
                      ? ""
                      : String(stockValue),
                };
              })
            : [],
        );
        setSurfaces(Array.isArray(data.surfaces) ? data.surfaces : []);
        setImageUrls(Array.isArray(data.images) ? data.images : []);
        setPrimaryImage(Array.isArray(data.images) ? data.images[0] || "" : "");
        setCategoryId(data.categoryId || null);
        setBrandId(data.brandId || null);
        setTypeValue(data.type || "");
      })
      .catch((err) => {
        console.error(err);
        showToast("Не удалось загрузить товар", "error");
      })
      .finally(() => setLoading(false));
  }, [productId, showToast]);

  useEffect(() => {
    void fetchLookups();
  }, []);

  useEffect(() => {
    if (!name.trim()) {
      setSlug("");
      return;
    }
    setSlug(slugify(name));
  }, [name]);

  useEffect(() => {
    if (sku.trim()) return;

    const categorySlug =
      categories.find((c) => c.id === categoryId)?.slug || "cat";
    const brandSlug = brands.find((b) => b.id === brandId)?.slug || "br";
    const typeSlug = typeValue || "paint";
    const base = `${slugify(name || "product")
      .slice(0, 3)
      .toUpperCase()}-${slugify(categorySlug).slice(0, 3).toUpperCase()}-${slugify(brandSlug).slice(0, 3).toUpperCase()}-${slugify(typeSlug).slice(0, 3).toUpperCase()}`;
    setSku(base);
  }, [sku, name, categoryId, brandId, typeValue, categories, brands]);

  useEffect(() => {
    if (!name.trim()) {
      setBreadcrumbs("Главная / Каталог");
      return;
    }
    setBreadcrumbs(generatedBreadcrumbs);
  }, [generatedBreadcrumbs, name]);

  async function fetchLookups() {
    try {
      const [cRes, bRes, surfaceRes, paintTypeRes, pRes] = await Promise.all([
        fetch("/api/admin/categories", { credentials: "include" }),
        fetch("/api/admin/brands", { credentials: "include" }),
        fetch("/api/admin/dictionaries?type=surfaces", {
          credentials: "include",
        }),
        fetch("/api/admin/dictionaries?type=paintTypes", {
          credentials: "include",
        }),
        fetch("/api/admin/products", { credentials: "include" }),
      ]);

      if (cRes.ok) setCategories(await cRes.json());
      if (bRes.ok) setBrands(await bRes.json());

      const dictSurfaces = surfaceRes.ok ? await surfaceRes.json() : [];
      const dictTypes = paintTypeRes.ok ? await paintTypeRes.json() : [];

      const surfacesFromDict = Array.isArray(dictSurfaces)
        ? dictSurfaces.map((item: any) => item.name)
        : [];
      const typesFromDict = Array.isArray(dictTypes)
        ? dictTypes.map((item: any) => item.name)
        : [];

      if (pRes.ok) {
        const products = await pRes.json();
        const surfacesFromProducts = Array.from(
          new Set(
            (products as Array<any>)
              .flatMap((product) =>
                Array.isArray(product.surfaces) ? product.surfaces : [],
              )
              .filter(Boolean),
          ),
        );
        const typesFromProducts = Array.from(
          new Set(
            (products as Array<any>)
              .map((product) => product.type)
              .filter(Boolean),
          ),
        );

        setSurfaceOptions(
          Array.from(new Set([...surfacesFromDict, ...surfacesFromProducts])),
        );
        setTypeOptions(
          Array.from(new Set([...typesFromDict, ...typesFromProducts])),
        );
      } else {
        setSurfaceOptions(surfacesFromDict);
        setTypeOptions(typesFromDict);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const formatZodErrors = (errors: any): string[] => {
    const messages: string[] = [];
    if (!errors || typeof errors !== "object") return messages;

    const translateKey = (k: string) => {
      switch (k) {
        case "name": return "Название";
        case "slug": return "Слаг";
        case "price": return "Цена";
        case "stock": return "Остаток";
        case "colors": return "Цвета";
        case "categoryId": return "Категория";
        case "brandId": return "Бренд";
        default: return k;
      }
    };

    for (const key of Object.keys(errors)) {
      if (key === "_errors") {
        if (Array.isArray(errors._errors)) {
          messages.push(...errors._errors);
        }
        continue;
      }

      const field = errors[key];
      if (field && typeof field === "object") {
        if (key === "colors") {
          for (const idx of Object.keys(field)) {
            if (idx === "_errors") {
              if (Array.isArray(field._errors)) {
                messages.push(...field._errors);
              }
              continue;
            }
            const colorErr = field[idx];
            if (colorErr && colorErr.hex && Array.isArray(colorErr.hex._errors)) {
              messages.push(`Цвет #${Number(idx) + 1}: ${colorErr.hex._errors.join(", ")}`);
            }
          }
        } else {
          if (Array.isArray(field._errors)) {
            messages.push(`${translateKey(key)}: ${field._errors.join(", ")}`);
          }
        }
      }
    }

    return messages;
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim() || price === "") {
      showToast("Заполните имя, слаг и цену", "error");
      return;
    }

    if (looksLikePaintProduct && normalizedColors.length === 0) {
      showToast("Для краски нужно добавить хотя бы один цвет", "error");
      return;
    }

    setLoading(true);
    try {
      if (colorEntries.some((entry) => !entry.hex.trim())) {
        showToast("Укажите код цвета для каждого варианта", "error");
        setLoading(false);
        return;
      }

      const body = {
        name,
        slug,
        sku,
        price: Number(price),
        stock: derivedStock,
        images: imageUrls.length ? imageUrls : [],
        description,
        shortSpec,
        application,
        breadcrumbs: breadcrumbs
          .split("/")
          .map((s) => s.trim())
          .filter(Boolean),
        packaging: [
          {
            volume: Number(volume || 1),
            price: Number(price || 0),
            sku: sku || slug || `SKU-${Date.now()}`,
          },
        ],
        colors: normalizedColors,
        colorable: normalizedColors.length > 0 || looksLikePaintProduct,
        specs: {
          composition,
          consumption: consumption === "" ? undefined : consumption,
          coverage,
        },
        categoryId,
        brandId,
        type: typeValue || undefined,
        surfaces,
      };

      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";
      const method = productId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error(err);
        if (err && err.errors) {
          const messages = formatZodErrors(err.errors);
          if (messages.length > 0) {
            showToast(`Ошибка валидации: ${messages.join("; ")}`, "error");
            setLoading(false);
            return;
          }
        }
        throw new Error("Server error");
      }

      showToast("Сохранено", "success");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      showToast("Ошибка при сохранении", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch("/api/admin/uploads", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, dataUrl }),
          });
          if (!res.ok) throw new Error("Upload failed");
          const json = await res.json();
          setImageUrls((prev) => {
            const next = [...prev, json.url];
            if (!primaryImage) setPrimaryImage(json.url);
            return next;
          });
        } catch (err) {
          console.error(err);
          showToast("Ошибка при загрузке изображения", "error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (prev[idx] === primaryImage) {
        setPrimaryImage(next[0] || "");
      }
      return next;
    });
  };

  const addColor = () =>
    setColorEntries((c) => [...c, { hex: "#ffffff", name: "", stock: "" }]);
  const removeColor = (idx: number) =>
    setColorEntries((c) => c.filter((_, i) => i !== idx));
  const setColorEntriesValue = (value: ColorEntry[]) => setColorEntries(value);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}0-9\s-]/gu, "")
      .trim()
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const toggleSurface = (value: string) => {
    setSurfaces((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const createCategory = async () => {
    // Open modal to create category (slug optional)
    setOpenCategory(false);
    openDictModal("category");
  };

  const createBrand = async () => {
    // Open modal to create brand (slug optional)
    setOpenBrand(false);
    openDictModal("brand");
  };

  const createDictionaryValue = async (type: "surfaces" | "paintTypes") => {
    const value = type === "surfaces" ? newSurface : newPaintType;
    if (!value.trim()) return;

    const res = await fetch("/api/admin/dictionaries", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value.trim(), type }),
    });

    if (res.ok) {
      await fetchLookups();
      if (type === "surfaces") setNewSurface("");
      else setNewPaintType("");
      showToast("Справочник обновлён", "success");
    } else {
      showToast("Ошибка добавления справочника", "error");
    }
  };

  const openDictModal = (
    type: "surfaces" | "paintTypes" | "category" | "brand",
  ) => {
    setDictModalType(type);
    setDictModalValue("");
    setDictModalSlug("");
    setDictModalOpen(true);
  };

  const submitDictModal = async () => {
    if (!dictModalType) return;
    const name = dictModalValue.trim();
    if (!name) return;

    try {
      if (dictModalType === "category" || dictModalType === "brand") {
        const body: any = { name };
        if (dictModalSlug.trim()) body.slug = dictModalSlug.trim();
        const url =
          dictModalType === "category"
            ? "/api/admin/categories"
            : "/api/admin/brands";
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const item = await res.json();
          if (dictModalType === "category") {
            setCategories((s) => [...s, item]);
            setCategoryId(item.id);
          } else {
            setBrands((s) => [...s, item]);
            setBrandId(item.id);
          }
          await fetchLookups();
          showToast(
            dictModalType === "category" ? "Категория создана" : "Бренд создан",
            "success",
          );
          setDictModalOpen(false);
        } else {
          showToast("Ошибка создания", "error");
        }
      } else {
        const res = await fetch("/api/admin/dictionaries", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type: dictModalType }),
        });
        if (res.ok) {
          await fetchLookups();
          showToast("Справочник обновлён", "success");
          setDictModalOpen(false);
        } else {
          showToast("Ошибка добавления справочника", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Ошибка сети", "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {productId ? "Редактирование товара" : "Новый товар"}
          </p>
          <h2 className="text-2xl font-semibold">
            {name || "Карточка товара"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Сохраняю..." : "Сохранить"}
          </Button>
        </div>
      </div>
      {dictModalOpen && (
        <Dialog open={dictModalOpen} onOpenChange={setDictModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dictModalType === "surfaces"
                  ? "Добавить поверхность"
                  : "Добавить тип краски"}
              </DialogTitle>
              <DialogDescription>
                Введите название и нажмите сохранить.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <Input
                value={dictModalValue}
                onChange={(e) => setDictModalValue(e.target.value)}
                placeholder="Название"
              />
              {(dictModalType === "category" || dictModalType === "brand") && (
                <Input
                  className="mt-2"
                  value={dictModalSlug}
                  onChange={(e) => setDictModalSlug(e.target.value)}
                  placeholder="Slug (необязательно)"
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDictModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={submitDictModal}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="aspect-[4/3.2] overflow-hidden rounded-xl border border-border/60 bg-muted/40">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={name || "Товар"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Фото товара будет здесь
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {imageUrls.length > 0 ? (
                imageUrls.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setPrimaryImage(url)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border ${primaryImage === url ? "border-primary" : "border-border/60"}`}
                  >
                    <img
                      src={url}
                      alt={`thumb-${idx}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-sm text-muted-foreground">
                  Пока нет изображений
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-border/60 p-4">
              <p className="text-sm font-medium">Загрузить изображения</p>
              <p className="mt-1 text-sm text-muted-foreground">
                JPG, PNG, WebP — можно сразу несколько файлов.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="mt-3 block w-full text-sm"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Превью карточки
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">
                  {name || "Название товара"}
                </p>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {sku || "SKU"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {shortSpec || "Краткая характеристика будет здесь"}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">
                  {finalPriceWithCommission > 0
                    ? `${finalPriceWithCommission.toLocaleString("ru-RU")} ₽`
                    : "Цена"}
                </span>
                <span className="text-muted-foreground">
                  / {volume ? `${Number(volume)} л` : "объём"}
                </span>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/10 p-2 text-xs text-muted-foreground">
                Превью включает 20% комиссии, рассчитанной от указанной цены.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Название</span>
                  <FieldHint text="Введите название товара так, как его увидит клиент. Слаг будет подставлен автоматически из названия." />
                </div>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Slug</span>
                  <FieldHint text="URL товара генерируется автоматически на основе названия и не требует ручного ввода." />
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  {slug || "будет создан автоматически"}
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Артикул (SKU)</span>
                  <FieldHint text="Введите уникальный код товара, например: TIK-INT-01. Если оставить пустым, он будет предложен автоматически по бренду, категории и типу." />
                </div>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Остаток</span>
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  {derivedStock}
                  <span className="ml-2 text-xs">сумма по цветам</span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Цена (₽)</span>
                  <FieldHint text="Цена указывается в рублях за выбранную фасовку. Для карточки товара это основной базовый параметр." />
                </div>
                <Input
                  type="number"
                  value={price as number | string}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
                <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-900">
                  <div className="flex items-center justify-between gap-2">
                    <span>Комиссия Hzcompany</span>
                    <span className="font-semibold">
                      {commissionAmount > 0
                        ? `${commissionAmount.toLocaleString("ru-RU")} ₽`
                        : "—"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 font-semibold">
                    <span>Итоговая цена</span>
                    <span>
                      {finalPriceWithCommission > 0
                        ? `${finalPriceWithCommission.toLocaleString("ru-RU")} ₽`
                        : "—"}
                    </span>
                  </div>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Объём (л)</span>
                  <FieldHint text="Указывайте стандартный объём фасовки, например 1, 5, 10 или 20 литров." />
                </div>
                <Input
                  type="number"
                  value={volume as number | string}
                  onChange={(e) =>
                    setVolume(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Категория</span>
                  <FieldHint text="Выбирайте категорию из списка. Она влияет на фильтры каталога и хлебные крошки." />
                </div>
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-left text-sm"
                    onClick={() => setOpenCategory((s) => !s)}
                  >
                    {categories.find((c) => c.id === categoryId)?.name ||
                      "-- Выберите --"}
                  </button>
                  {openCategory && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border bg-card p-2 shadow-sm">
                      <div className="max-h-48 overflow-auto">
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCategoryId(c.id);
                              setOpenCategory(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-muted/60"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpenCategory(false);
                            void createCategory();
                          }}
                        >
                          + Добавить
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCategoryId(null);
                            setOpenCategory(false);
                          }}
                        >
                          Очистить
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Бренд</span>
                  <FieldHint text="Выбирайте бренд из базы. Если нужного бренда нет — создайте его с помощью кнопки справа." />
                </div>
                <div className="relative" ref={brandRef}>
                  <button
                    type="button"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-left text-sm"
                    onClick={() => setOpenBrand((s) => !s)}
                  >
                    {brands.find((b) => b.id === brandId)?.name ||
                      "-- Выберите --"}
                  </button>
                  {openBrand && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border bg-card p-2 shadow-sm">
                      <div className="max-h-48 overflow-auto">
                        {brands.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setBrandId(b.id);
                              setOpenBrand(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-muted/60"
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpenBrand(false);
                            void createBrand();
                          }}
                        >
                          + Добавить
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBrandId(null);
                            setOpenBrand(false);
                          }}
                        >
                          Очистить
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Поверхности</span>
                  <FieldHint text="Выбирайте поверхности, на которые подходит краска. Это влияет на фильтры и карточку товара." />
                </div>
                <div className="relative" ref={surfacesRef}>
                  <button
                    type="button"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-left text-sm"
                    onClick={() => setOpenSurfaces((s) => !s)}
                  >
                    {surfaces.length > 0
                      ? `${surfaces.length} выбран(о)`
                      : "-- Выберите поверхности --"}
                  </button>
                  {openSurfaces && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border bg-card p-2 shadow-sm">
                      <div className="max-h-48 overflow-auto">
                        {surfaceOptions.length > 0 ? (
                          surfaceOptions.map((option) => {
                            const active = surfaces.includes(option);
                            return (
                              <label
                                key={option}
                                className="flex items-center gap-2 px-2 py-1 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => toggleSurface(option)}
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })
                        ) : (
                          <div className="text-sm text-muted-foreground px-2 py-1">
                            Пока нет доступных поверхностей
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpenSurfaces(false);
                            openDictModal("surfaces");
                          }}
                        >
                          + Добавить
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSurfaces([]);
                            setOpenSurfaces(false);
                          }}
                        >
                          Очистить
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Тип краски</span>
                  <FieldHint text="Выберите основной тип состава: акриловая, алкидная, водоэмульсионная и т.д. Это помогает пользователю быстрее найти нужный товар." />
                </div>
                <div className="relative" ref={typeRef}>
                  <button
                    type="button"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-left text-sm"
                    onClick={() => setOpenType((s) => !s)}
                  >
                    {typeValue || "-- Выберите --"}
                  </button>
                  {openType && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border bg-card p-2 shadow-sm">
                      <div className="max-h-48 overflow-auto">
                        {typeOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setTypeValue(option);
                              setOpenType(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-muted/60"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpenType(false);
                            openDictModal("paintTypes");
                          }}
                        >
                          + Добавить
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTypeValue("");
                            setOpenType(false);
                          }}
                        >
                          Очистить
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Кратко</span>
                  <FieldHint text="Короткая характеристика для карточки каталога: матовая, влагостойкая, для стен и потолка." />
                </div>
                <Input
                  value={shortSpec}
                  onChange={(e) => setShortSpec(e.target.value)}
                  placeholder="Матовая водоэмульсионка"
                />
              </label>
            </div>

            <div className="mt-6">
              {looksLikePaintProduct && normalizedColors.length === 0 && (
                <p className="mb-2 text-xs text-amber-700">
                  Для краски нужен хотя бы один цвет.
                </p>
              )}
              <AdminColorVariantBlock
                colorEntries={colorEntries}
                onChange={setColorEntriesValue}
                onAdd={addColor}
                onRemove={removeColor}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Контент и характеристики</h3>
            <div className="mt-4 space-y-4">
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Хлебные крошки</span>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  {breadcrumbs || "Главная / Каталог"}
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Описание</span>
                  <FieldHint text="Короткое/полное описание товара — показывается на карточке и в детальной странице." />
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </label>

              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Инструкция</span>
                  <FieldHint text="Как применять продукт (подготовка поверхности, разведённость, способы нанесения)." />
                </div>
                <Textarea
                  value={application}
                  onChange={(e) => setApplication(e.target.value)}
                  rows={4}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Состав</span>
                    <FieldHint text="Основные компоненты/ингредиенты (важно для маркировки и аллергий)." />
                  </div>
                  <Input
                    value={composition}
                    onChange={(e) => setComposition(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Расход</span>
                    <FieldHint text="Расход в м²/литр (например, 6.5). Вводите числом." />
                  </div>
                  <Input
                    type="number"
                    value={consumption}
                    onChange={(e) =>
                      setConsumption(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="0"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Время высыхания</span>
                    <FieldHint text="Время высыхания в часах/минутах, указывайте диапазон (например 1–2 ч)." />
                  </div>
                  <Input
                    value={dryingTime}
                    onChange={(e) => setDryingTime(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Укрывистость</span>
                    <FieldHint text="Укрывистость: рекомендуемое количество слоёв или краткое описание (например 1–2 слоя)." />
                  </div>
                  <Input
                    value={coverage}
                    onChange={(e) => setCoverage(e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
