'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Product, Category, Brand } from '@/lib/types'

interface ProductFormProps {
  product: Product | null
  onSave: (productData: Partial<Product>) => void
  onCancel: () => void
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    images: product?.images ?? [],
    categoryId: product?.categoryId ?? '',
    brandId: product?.brandId ?? '',
    type: product?.type ?? '',
    shortSpec: product?.shortSpec ?? '',
    application: product?.application ?? '',
    colorable: product?.colorable ?? false,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/brands'),
      ])
      setCategories(await catRes.json())
      setBrands(await brandRes.json())
    }
    fetchData()
  }, [])

  useEffect(() => {
    setFormData({
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      images: product?.images ?? [],
      categoryId: product?.categoryId ?? '',
      brandId: product?.brandId ?? '',
      type: product?.type ?? '',
      shortSpec: product?.shortSpec ?? '',
      application: product?.application ?? '',
      colorable: product?.colorable ?? false,
    })
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: Partial<Product>) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: Partial<Product>) => ({ ...prev, [name]: Number(value) }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<Product>) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setIsUploading(true)
    try {
      const dataUrls = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
              reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
              reader.readAsDataURL(file)
            }),
        ),
      )

      setFormData((prev: Partial<Product>) => ({
        ...prev,
        images: [...(Array.isArray(prev.images) ? prev.images : []), ...dataUrls],
      }))
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      price: Number(formData.price ?? 0),
      stock: Number(formData.stock ?? 0),
      images: Array.isArray(formData.images)
        ? formData.images
        : (formData.images as string)?.split(',').map((item) => item.trim()).filter(Boolean),
      colorable: Boolean(formData.colorable),
    }
    onSave(payload)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Редактировать товар' : 'Создать товар'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Название</Label>
              <Input id="name" name="name" value={formData.name ?? ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="slug">Слаг</Label>
              <Input id="slug" name="slug" value={formData.slug ?? ''} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" name="description" value={formData.description ?? ''} onChange={handleChange} rows={4} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="price">Цена</Label>
              <Input id="price" name="price" type="number" value={formData.price ?? 0} onChange={handleNumberChange} />
            </div>
            <div>
              <Label htmlFor="stock">Остаток</Label>
              <Input id="stock" name="stock" type="number" value={formData.stock ?? 0} onChange={handleNumberChange} />
            </div>
            <div>
              <Label htmlFor="type">Тип</Label>
              <Select name="type" onValueChange={(value) => handleSelectChange('type', value)} value={formData.type ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {['interior', 'facade', 'primer', 'enamel', 'anticor', 'special'].map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="categoryId">Категория</Label>
              <Select name="categoryId" onValueChange={(value) => handleSelectChange('categoryId', value)} value={formData.categoryId ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brandId">Бренд</Label>
              <Select name="brandId" onValueChange={(value) => handleSelectChange('brandId', value)} value={formData.brandId ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите бренд" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="images">Изображения</Label>
              <Input id="images" name="images" type="file" accept="image/*" multiple onChange={handleImageUpload} />
              <p className="mt-1 text-xs text-muted-foreground">
                {isUploading ? 'Загрузка…' : 'Можно выбрать сразу несколько фото с компьютера.'}
              </p>
              {Array.isArray(formData.images) && formData.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="h-16 w-16 overflow-hidden rounded-md border border-border bg-muted">
                      {image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/') ? (
                        <img src={image} alt={`Изображение ${index + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full" style={{ backgroundColor: image }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="shortSpec">Краткая спецификация</Label>
              <Input id="shortSpec" name="shortSpec" value={formData.shortSpec ?? ''} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="application">Применение</Label>
            <Input id="application" name="application" value={formData.application ?? ''} onChange={handleChange} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="colorable" checked={Boolean(formData.colorable)} onCheckedChange={(value) => setFormData((prev) => ({ ...prev, colorable: Boolean(value) }))} />
            <Label htmlFor="colorable">Поддерживает колеровку</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
