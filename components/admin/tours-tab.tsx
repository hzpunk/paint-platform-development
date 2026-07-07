"use client"

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react"
import { tourImageList, tourPrimaryImage } from "@/lib/tour-images"
import { SafeImage } from "@/components/safe-image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/components/toast-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  MapPin, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye,
  DollarSign,
  AlertCircle,
  Upload,
  Link2,
  ChevronUp,
  ChevronDown,
  ImageIcon,
} from "lucide-react"

// ===== CONSTANTS (вынесены за пределы компонента) =====
const TEXT = {
  ru: {
    title: "Управление турами",
    createTour: "Создать тур",
    editTour: "Редактировать тур",
    viewTour: "Просмотр тура",
    titleRu: "Название (RU)",
    titleEn: "Название (EN)",
    descriptionRu: "Описание (RU)",
    descriptionEn: "Описание (EN)",
    includedRu: "Что включено (RU)",
    includedEn: "Что включено (EN)",
    photosTitle: "Фотографии тура",
    uploadFromPc: "Загрузить с компьютера",
    addByUrl: "Добавить по ссылке",
    addUrlBtn: "Добавить",
    urlPlaceholder: "https://… или ссылка на изображение",
    removePhoto: "Убрать",
    moveUp: "Выше",
    moveDown: "Ниже",
    noPhotosHint: "Можно несколько файлов. Первое фото — обложка в списке туров.",
    basePrice: "Базовая цена",
    markup: "Наценка",
    finalPrice: "Итоговая цена",
    startDate: "Дата начала",
    endDate: "Дата окончания",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    confirmDelete: "Удалить этот тур?",
    created: "Тур создан",
    updated: "Тур обновлён",
    deleted: "Тур удалён",
    error: "Ошибка",
    noTours: "Туры не найдены",
    perPerson: "₽/чел",
    validationTitleRu: "Введите название (RU)",
    validationTitleEn: "Введите название (EN)",
    validationPrice: "Цена должна быть больше 0",
    validationDates: "Дата окончания должна быть после даты начала",
    validationError: "Исправьте ошибки в форме",
  },
  en: {
    title: "Tour Management",
    createTour: "Create Tour",
    editTour: "Edit Tour",
    viewTour: "View Tour",
    titleRu: "Title (RU)",
    titleEn: "Title (EN)",
    descriptionRu: "Description (RU)",
    descriptionEn: "Description (EN)",
    includedRu: "What's included (RU)",
    includedEn: "What's included (EN)",
    photosTitle: "Tour photos",
    uploadFromPc: "Upload from computer",
    addByUrl: "Add by URL",
    addUrlBtn: "Add",
    urlPlaceholder: "https://… or image URL",
    removePhoto: "Remove",
    moveUp: "Up",
    moveDown: "Down",
    noPhotosHint: "Multiple files allowed. First photo is the cover in tour lists.",
    basePrice: "Base Price",
    markup: "Markup",
    finalPrice: "Final Price",
    startDate: "Start Date",
    endDate: "End Date",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Delete this tour?",
    created: "Tour created",
    updated: "Tour updated",
    deleted: "Tour deleted",
    error: "Error",
    noTours: "No tours found",
    perPerson: "₽/person",
    validationTitleRu: "Enter title (RU)",
    validationTitleEn: "Enter title (EN)",
    validationPrice: "Price must be greater than 0",
    validationDates: "End date must be after start date",
    validationError: "Please fix form errors",
  }
}

const INITIAL_FORM_DATA = {
  title_ru: "",
  title_en: "",
  description_ru: "",
  description_en: "",
  included_ru: "",
  included_en: "",
  gallery_urls: [] as string[],
  base_price: 0,
  markup_percent: 10,
  start_date: "",
  end_date: "",
}

// ===== TYPES =====
interface Tour {
  id: string
  title_ru: string
  title_en: string
  description_ru: string | null
  description_en: string | null
  image_url: string | null
  tour_images?: unknown
  price_per_person: number
  base_price: number | null
  markup_percent: number | null
  start_date: string | null
  end_date: string | null
  included_ru: string | null
  included_en: string | null
  created_at: string
}

interface TourFormData {
  title_ru: string
  title_en: string
  description_ru: string
  description_en: string
  included_ru: string
  included_en: string
  gallery_urls: string[]
  base_price: number
  markup_percent: number
  start_date: string
  end_date: string
}

type FormMode = "create" | "edit"

// Кэш для API запросов (простой in-memory cache)
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5000 // 5 секунд

// ===== FORM VALIDATION =====
interface ValidationError {
  field: string
  message: string
}

function validateForm(data: TourFormData, t: Record<string, string>): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!data.title_ru.trim()) {
    errors.push({ field: "title_ru", message: t.validationTitleRu || "Title RU is required" })
  }
  if (!data.title_en.trim()) {
    errors.push({ field: "title_en", message: t.validationTitleEn || "Title EN is required" })
  }
  if (data.base_price <= 0) {
    errors.push({ field: "base_price", message: t.validationPrice || "Price must be greater than 0" })
  }
  if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
    errors.push({ field: "end_date", message: t.validationDates || "End date must be after start date" })
  }
  
  return errors
}

// ===== TOUR CARD COMPONENT (memoized) =====
interface TourCardProps {
  tour: Tour
  t: Record<string, string>
  formatCurrency: (amount: number) => string
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

const TourCard = memo(function TourCard({ tour, t, formatCurrency, onView, onEdit, onDelete }: TourCardProps) {
  const cover = tourPrimaryImage(tour)
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-28 sm:w-44 lg:h-24 lg:w-36">
          <SafeImage src={cover} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 144px" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{tour.title_ru}</h3>
          <p className="text-sm text-gray-600">{tour.title_en}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-green-100 text-green-800">
              {formatCurrency(tour.price_per_person)} {t.perPerson}
            </Badge>
            {tour.markup_percent && (
              <Badge className="bg-purple-100 text-purple-800">
                +{tour.markup_percent}% {t.markup}
              </Badge>
            )}
            <Badge variant="outline">
              {tour.start_date ? new Date(tour.start_date).toLocaleDateString() : "-"} - {tour.end_date ? new Date(tour.end_date).toLocaleDateString() : "-"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{tour.description_ru}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
})

// ===== FORM FIELD COMPONENT =====
interface FormFieldProps {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  error?: string
  type?: "text" | "textarea" | "number" | "date"
  placeholder?: string
  min?: number
  max?: number
  rows?: number
}

const FormField = memo(function FormField({ 
  label, value, onChange, error, type = "text", placeholder, min, max, rows 
}: FormFieldProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = type === "number" ? Number(e.target.value) : e.target.value
    onChange(val)
  }, [type, onChange])

  return (
    <div>
      <Label className={error ? "text-red-500" : ""}>{label}</Label>
      {type === "textarea" ? (
        <Textarea 
          value={value} 
          onChange={handleChange} 
          className={error ? "border-red-500" : ""}
          rows={rows || 3}
          placeholder={placeholder}
        />
      ) : (
        <Input 
          type={type}
          value={value} 
          onChange={handleChange} 
          className={error ? "border-red-500" : ""}
          placeholder={placeholder}
          min={min}
          max={max}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
})

export default function AdminToursTab() {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [formData, setFormData] = useState<TourFormData>(INITIAL_FORM_DATA)
  const [formErrors, setFormErrors] = useState<ValidationError[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState("")
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  
  // Ref для отмены запросов при размонтировании
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = TEXT[language]

  const appendGalleryUrls = useCallback((urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      gallery_urls: [...new Set([...prev.gallery_urls, ...urls])].slice(0, 24),
    }))
  }, [])

  const removeGalleryAt = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx),
    }))
  }

  const moveGallery = (idx: number, dir: -1 | 1) => {
    setFormData((prev) => {
      const arr = [...prev.gallery_urls]
      const j = idx + dir
      if (j < 0 || j >= arr.length) return prev
      const a = arr[idx]!
      const b = arr[j]!
      arr[idx] = b
      arr[j] = a
      return { ...prev, gallery_urls: arr }
    })
  }

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploadingPhotos(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file, file.name || "upload.jpg")
        const response = await fetch("/api/admin/tours/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        })
        const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string }
        if (response.ok && typeof payload.url === "string") {
          appendGalleryUrls([payload.url])
        } else {
          showToast(payload.error || t.error, "error")
        }
      }
    } catch {
      showToast(t.error, "error")
    } finally {
      setUploadingPhotos(false)
      e.target.value = ""
    }
  }

  const addLinkFromDraft = () => {
    const u = linkDraft.trim()
    if (!u) return
    appendGalleryUrls([u])
    setLinkDraft("")
  }

  // Мемоизированная функция загрузки с кэшированием
  const fetchTours = useCallback(async (force = false) => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    
    // Проверяем кэш
    const cacheKey = "tours"
    const cached = apiCache.get(cacheKey)
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setTours(cached.data.tours || [])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch("/api/admin/tours", {
        signal: abortControllerRef.current.signal,
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setTours(data.tours || [])
      // Сохраняем в кэш
      apiCache.set(cacheKey, { data, timestamp: Date.now() })
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching tours:", error)
        showToast(t.error, "error")
      }
    } finally {
      setLoading(false)
    }
  }, [showToast, t.error])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    fetchTours()
  }, [fetchTours])

  // Мемоизированные вычисления
  const calculateFinalPrice = useCallback((basePrice: number, markupPercent: number) => {
    return Math.round(basePrice * (1 + markupPercent / 100))
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount) + " ₽"
  }, [])

  const handleSubmit = async () => {
    if (submitting) return
    
    // Валидация
    const errors = validateForm(formData, t)
    if (errors.length > 0) {
      setFormErrors(errors)
      showToast(t.validationError, "error")
      return
    }
    setFormErrors([])
    
    setSubmitting(true)
    
    const isCreate = formMode === "create"
    const url = isCreate ? "/api/admin/tours/create" : "/api/admin/tours/update"
    const price_per_person = calculateFinalPrice(formData.base_price, formData.markup_percent)
    const bodyCommon = {
      title_ru: formData.title_ru,
      title_en: formData.title_en,
      description_ru: formData.description_ru,
      description_en: formData.description_en,
      included_ru: formData.included_ru,
      included_en: formData.included_en,
      gallery_urls: formData.gallery_urls,
      image_url: formData.gallery_urls[0] || "",
      base_price: formData.base_price,
      markup_percent: formData.markup_percent,
      start_date: formData.start_date,
      end_date: formData.end_date,
      price_per_person,
    }
    const body = isCreate ? bodyCommon : { tourId: selectedTour?.id, ...bodyCommon }

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        showToast(isCreate ? t.created : t.updated, "success")
        closeForm()
        invalidateCache()
        await fetchTours(true) // Форсированная загрузка
      } else {
        showToast(data.error || t.error, "error")
      }
    } catch (error) {
      console.error("Submit error:", error)
      showToast(t.error, "error")
    } finally {
      setSubmitting(false)
    }
  }

  const openCreateDialog = () => {
    setSelectedTour(null)
    setFormData(INITIAL_FORM_DATA)
    setFormErrors([])
    setLinkDraft("")
    setFormMode("create")
  }

  const openEditDialog = (tour: Tour) => {
    setSelectedTour(tour)
    setLinkDraft("")
    setFormData({
      title_ru: tour.title_ru,
      title_en: tour.title_en,
      description_ru: tour.description_ru || "",
      description_en: tour.description_en || "",
      included_ru: tour.included_ru || "",
      included_en: tour.included_en || "",
      gallery_urls: tourImageList(tour),
      base_price: tour.base_price || tour.price_per_person,
      markup_percent: tour.markup_percent || 10,
      start_date: tour.start_date || "",
      end_date: tour.end_date || "",
    })
    setFormErrors([])
    setFormMode("edit")
  }

  const closeForm = () => {
    setFormMode(null)
    setFormData(INITIAL_FORM_DATA)
    setFormErrors([])
    setLinkDraft("")
  }

  const handleDelete = async (tourId: string) => {
    if (!confirm(t.confirmDelete)) return

    try {
      const response = await fetch("/api/admin/tours/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      })

      if (response.ok) {
        showToast(t.deleted, "success")
        setTours((prev) => prev.filter((tour) => tour.id !== tourId))
      } else {
        showToast(t.error, "error")
      }
    } catch (error) {
      showToast(t.error, "error")
    }
  }

  const openViewDialog = (tour: Tour) => {
    setSelectedTour(tour)
    setIsViewOpen(true)
  }

  // Очистка кэша при создании/обновлении
  const invalidateCache = useCallback(() => {
    apiCache.delete("tours")
  }, [])

  // Проверка есть ли ошибки для поля
  const getFieldError = (field: string) => formErrors.find(e => e.field === field)?.message
  const hasError = (field: string) => formErrors.some(e => e.field === field)

  // ===== MEMOIZED RENDER =====
  // Мемоизируем список туров чтобы избежать перерендеров
  const tourList = useMemo(() => {
    if (tours.length === 0) return (
      <div className="text-center py-8 text-gray-500">{t.noTours}</div>
    )
    
    return tours.map((tour) => (
      <TourCard
        key={tour.id}
        tour={tour}
        t={t}
        formatCurrency={formatCurrency}
        onView={() => openViewDialog(tour)}
        onEdit={() => openEditDialog(tour)}
        onDelete={() => handleDelete(tour.id)}
      />
    ))
  }, [tours, t, formatCurrency])

  return (
    <div className="space-y-6">
      {/* Unified Form Dialog */}
      <Dialog open={!!formMode} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? t.createTour : t.editTour}</DialogTitle>
          </DialogHeader>
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {t.validationError}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t.titleRu} value={formData.title_ru} onChange={(val) => setFormData({...formData, title_ru: String(val)})} error={getFieldError("title_ru")} />
              <FormField label={t.titleEn} value={formData.title_en} onChange={(val) => setFormData({...formData, title_en: String(val)})} error={getFieldError("title_en")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t.descriptionRu} value={formData.description_ru} onChange={(val) => setFormData({...formData, description_ru: String(val)})} error={getFieldError("description_ru")} type="textarea" rows={3} />
              <FormField label={t.descriptionEn} value={formData.description_en} onChange={(val) => setFormData({...formData, description_en: String(val)})} error={getFieldError("description_en")} type="textarea" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t.includedRu} value={formData.included_ru} onChange={(val) => setFormData({...formData, included_ru: String(val)})} error={getFieldError("included_ru")} type="textarea" rows={2} />
              <FormField label={t.includedEn} value={formData.included_en} onChange={(val) => setFormData({...formData, included_en: String(val)})} error={getFieldError("included_en")} type="textarea" rows={2} />
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50/80 p-4 space-y-3">
              <Label className="flex items-center gap-2 text-green-900 font-semibold">
                <ImageIcon className="h-4 w-4" />
                {t.photosTitle}
              </Label>
              <p className="text-xs text-green-800/90">{t.noPhotosHint}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onFilesSelected}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-300 bg-white"
                  disabled={uploadingPhotos}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingPhotos ? "…" : t.uploadFromPc}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                  placeholder={t.urlPlaceholder}
                  className="flex-1 bg-white"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLinkFromDraft())}
                />
                <Button type="button" variant="secondary" className="shrink-0" onClick={addLinkFromDraft}>
                  <Link2 className="h-4 w-4 mr-2" />
                  {t.addUrlBtn}
                </Button>
              </div>
              {formData.gallery_urls.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">{language === "ru" ? "Фото пока не добавлены" : "No photos yet"}</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {formData.gallery_urls.map((src, idx) => (
                    <li key={`${src}-${idx}`} className="flex items-center gap-2 rounded-md border bg-white p-2">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                        <SafeImage src={src} alt="" fill className="object-cover" sizes="80px" />
                      </div>
                      <span className="flex-1 truncate text-xs text-gray-600">{src}</span>
                      <div className="flex flex-col gap-1">
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveGallery(idx, -1)} disabled={idx === 0} aria-label={t.moveUp}>
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveGallery(idx, 1)} disabled={idx === formData.gallery_urls.length - 1} aria-label={t.moveDown}>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => removeGalleryAt(idx)} aria-label={t.removePhoto}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {language === "ru" ? "Ценообразование" : "Pricing"}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField label={t.basePrice} value={formData.base_price} onChange={(val) => setFormData({...formData, base_price: Number(val)})} error={getFieldError("base_price")} type="number" />
                <FormField label={`${t.markup} %`} value={formData.markup_percent} onChange={(val) => setFormData({...formData, markup_percent: Number(val)})} error={getFieldError("markup_percent")} type="number" min={0} max={100} />
                <div>
                  <Label>{t.finalPrice}</Label>
                  <div className="h-9 flex items-center px-3 bg-white rounded-md border font-semibold text-green-600">
                    {formatCurrency(calculateFinalPrice(formData.base_price, formData.markup_percent))}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t.startDate} value={formData.start_date} onChange={(val) => setFormData({...formData, start_date: String(val)})} error={getFieldError("start_date")} type="date" />
              <FormField label={t.endDate} value={formData.end_date} onChange={(val) => setFormData({...formData, end_date: String(val)})} error={getFieldError("end_date")} type="date" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={closeForm}>{t.cancel}</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? <LoadingSpinner /> : t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t.title}
            </CardTitle>
            <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {t.createTour}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {tourList}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.viewTour}</DialogTitle>
          </DialogHeader>
          {selectedTour && (
            <div className="space-y-4">
              {tourImageList(selectedTour).length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {tourImageList(selectedTour).map((src) => (
                    <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                      <SafeImage src={src} alt={selectedTour.title_ru} fill className="object-cover" sizes="200px" />
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-500">{t.titleRu}</h4>
                  <p>{selectedTour.title_ru}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">{t.titleEn}</h4>
                  <p>{selectedTour.title_en}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-500">{t.descriptionRu}</h4>
                <p className="text-sm">{selectedTour.description_ru}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-500">{t.basePrice}</h4>
                  <p>{formatCurrency(selectedTour.base_price || selectedTour.price_per_person)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">{t.markup}</h4>
                  <p>{selectedTour.markup_percent || 10}%</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">{t.finalPrice}</h4>
                  <p className="font-bold text-green-600">{formatCurrency(selectedTour.price_per_person)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
