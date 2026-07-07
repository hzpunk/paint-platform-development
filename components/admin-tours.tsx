"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus, Eye, CalendarDays } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { TourProgramEditor } from "@/components/tour-program-editor"

interface Tour {
  id: string
  title_ru: string
  title_en: string
  description_ru: string
  description_en: string
  included_ru?: string
  included_en?: string
  image_url: string
  price_per_person: number
  start_date: string
  end_date: string
  created_at: string
}

interface TourFormData {
  title_ru: string
  title_en: string
  description_ru: string
  description_en: string
  included_ru: string
  included_en: string
  image_url: string
  price_per_person: number
  start_date: string
  end_date: string
}

const initialFormData: TourFormData = {
  title_ru: "",
  title_en: "",
  description_ru: "",
  description_en: "",
  included_ru: "",
  included_en: "",
  image_url: "",
  price_per_person: 0,
  start_date: "",
  end_date: "",
}

export function AdminTours() {
  const { t } = useLanguage()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [tourDays, setTourDays] = useState<any[]>([])
  const [formData, setFormData] = useState<TourFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTours = async () => {
    try {
      const response = await fetch("/api/admin/tours")
      if (response.ok) {
        const data = await response.json()
        setTours(data.tours || [])
      }
    } catch (error) {
      console.error("Error fetching tours:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTours()
  }, [])

  const handleCreateTour = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/tours/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchTours()
        setIsCreateDialogOpen(false)
        setFormData(initialFormData)
      } else {
        const error = await response.text()
        console.error("Error creating tour:", error)
      }
    } catch (error) {
      console.error("Error creating tour:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTour = async () => {
    if (!selectedTour || isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/tours/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTour.id, ...formData }),
      })

      if (response.ok) {
        await fetchTours()
        setIsEditDialogOpen(false)
        setSelectedTour(null)
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error("Error updating tour:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот тур?")) return

    try {
      const response = await fetch("/api/admin/tours/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tourId }),
      })

      if (response.ok) {
        await fetchTours()
      }
    } catch (error) {
      console.error("Error deleting tour:", error)
    }
  }

  const openEditDialog = (tour: Tour) => {
    setSelectedTour(tour)
    setFormData({
      title_ru: tour.title_ru,
      title_en: tour.title_en,
      description_ru: tour.description_ru,
      description_en: tour.description_en,
      included_ru: tour.included_ru || "",
      included_en: tour.included_en || "",
      image_url: tour.image_url,
      price_per_person: tour.price_per_person,
      start_date: tour.start_date,
      end_date: tour.end_date,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (tour: Tour) => {
    setSelectedTour(tour)
    setIsViewDialogOpen(true)
  }

  const openProgramDialog = async (tour: Tour) => {
    setSelectedTour(tour)
    setIsProgramDialogOpen(true)
    // Загружаем дни тура
    try {
      const response = await fetch(`/api/admin/tours/${tour.id}/program`)
      if (response.ok) {
        const data = await response.json()
        setTourDays(data.days || [])
      }
    } catch (error) {
      console.error("Error fetching tour program:", error)
      setTourDays([])
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка туров...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление турами</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Создать тур
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать новый тур</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title_ru">Название (RU)</Label>
                  <Input
                    id="title_ru"
                    value={formData.title_ru}
                    onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                    placeholder="Название тура на русском"
                  />
                </div>
                <div>
                  <Label htmlFor="title_en">Название (EN)</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Tour title in English"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_ru">Описание (RU)</Label>
                  <Textarea
                    id="description_ru"
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    placeholder="Описание тура на русском"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description_en">Описание (EN)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Tour description in English"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="included_ru">Что включено (RU)</Label>
                  <Textarea
                    id="included_ru"
                    value={formData.included_ru}
                    onChange={(e) => setFormData({ ...formData, included_ru: e.target.value })}
                    placeholder="Что включено в тур на русском"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="included_en">Что включено (EN)</Label>
                  <Textarea
                    id="included_en"
                    value={formData.included_en}
                    onChange={(e) => setFormData({ ...formData, included_en: e.target.value })}
                    placeholder="What's included in English"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">URL изображения</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_per_person">Цена за человека (₽)</Label>
                  <Input
                    id="price_per_person"
                    type="number"
                    value={formData.price_per_person}
                    onChange={(e) => setFormData({ ...formData, price_per_person: Number(e.target.value) })}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Дата начала</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Дата окончания</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTour} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {isSubmitting ? "Создание..." : "Создать тур"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tours.map((tour) => (
          <Card key={tour.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{tour.title_ru}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{tour.title_en}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary">{tour.price_per_person.toLocaleString()} ₽</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openViewDialog(tour)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openProgramDialog(tour)}>
                    <CalendarDays className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(tour)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTour(tour.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">{tour.description_ru}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать тур</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_title_ru">Название (RU)</Label>
                <Input
                  id="edit_title_ru"
                  value={formData.title_ru}
                  onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_title_en">Название (EN)</Label>
                <Input
                  id="edit_title_en"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_description_ru">Описание (RU)</Label>
                <Textarea
                  id="edit_description_ru"
                  value={formData.description_ru}
                  onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit_description_en">Описание (EN)</Label>
                <Textarea
                  id="edit_description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_included_ru">Что включено (RU)</Label>
                <Textarea
                  id="edit_included_ru"
                  value={formData.included_ru}
                  onChange={(e) => setFormData({ ...formData, included_ru: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="edit_included_en">Что включено (EN)</Label>
                <Textarea
                  id="edit_included_en"
                  value={formData.included_en}
                  onChange={(e) => setFormData({ ...formData, included_en: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_image_url">URL изображения</Label>
              <Input
                id="edit_image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_price_per_person">Цена за человека (₽)</Label>
                <Input
                  id="edit_price_per_person"
                  type="number"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData({ ...formData, price_per_person: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit_start_date">Дата начала</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_end_date">Дата окончания</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateTour} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Просмотр тура</DialogTitle>
          </DialogHeader>
          {selectedTour && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Название (RU)</h4>
                  <p>{selectedTour.title_ru}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Название (EN)</h4>
                  <p>{selectedTour.title_en}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Описание (RU)</h4>
                  <p className="text-sm">{selectedTour.description_ru}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Описание (EN)</h4>
                  <p className="text-sm">{selectedTour.description_en}</p>
                </div>
              </div>

              {(selectedTour.included_ru || selectedTour.included_en) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Что включено (RU)</h4>
                    <p className="text-sm">{selectedTour.included_ru}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Что включено (EN)</h4>
                    <p className="text-sm">{selectedTour.included_en}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold">Цена</h4>
                  <p>{selectedTour.price_per_person.toLocaleString()} ₽</p>
                </div>
                <div>
                  <h4 className="font-semibold">Дата начала</h4>
                  <p>{new Date(selectedTour.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Дата окончания</h4>
                  <p>{new Date(selectedTour.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedTour.image_url && (
                <div>
                  <h4 className="font-semibold">Изображение</h4>
                  <img
                    src={selectedTour.image_url || "/placeholder.svg"}
                    alt={selectedTour.title_ru}
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Program Editor Dialog */}
      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Редактирование программы тура: {selectedTour?.title_ru}
            </DialogTitle>
          </DialogHeader>
          {selectedTour && (
            <TourProgramEditor
              tourId={selectedTour.id}
              initialDays={tourDays}
              onSave={() => {
                setIsProgramDialogOpen(false)
                fetchTours()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
