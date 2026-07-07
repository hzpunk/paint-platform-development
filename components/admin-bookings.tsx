"use client"

import { useEffect, useState } from "react"
import { getAllBookings, updateBookingStatus } from "@/lib/actions/bookings"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/toast-provider"
import { useLanguage } from "@/components/language-provider"
import { LoadingSpinner } from "./loading-spinner"
import { Edit3, Eye, Phone, Mail, Calendar, Users, DollarSign, Search, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Booking {
  id: string
  user_id: string
  tour_id: string
  total_people: number
  children_count: number
  total_price: number
  status: string
  created_at: string
  users: {
    full_name: string
    email: string
    phone: string | null
  } | null
  tours: {
    title_ru: string
    title_en: string
  } | null
}

export default function AdminBookings() {
  const { t, language } = useLanguage()
  const { showToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const { success, data, error: fetchError } = await getAllBookings()
      if (success && data) {
        setBookings(data)
      } else {
        setError(fetchError || t("Не удалось загрузить бронирования."))
      }
    } catch (err: any) {
      setError(err.message || t("Произошла ошибка при загрузке бронирований."))
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (language === "ru" ? booking.tours?.title_ru : booking.tours?.title_en)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingBookingId(bookingId)
    try {
      const { success, error: updateError } = await updateBookingStatus(bookingId, newStatus)
      if (success) {
        showToast(t("Статус бронирования обновлен!"), "success")
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)))
        setEditingBookingId(null)
      } else {
        showToast(updateError || t("Ошибка при обновлении статуса"), "error")
      }
    } catch (err) {
      showToast(t("Произошла ошибка при обновлении статуса"), "error")
    } finally {
      setUpdatingBookingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{t("Подтверждено")}</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{t("Ожидает")}</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{t("Отменено")}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getBookingStats = () => {
    const total = bookings.length
    const confirmed = bookings.filter((b) => b.status === "confirmed").length
    const pending = bookings.filter((b) => b.status === "pending").length
    const cancelled = bookings.filter((b) => b.status === "cancelled").length
    const totalRevenue = bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.total_price, 0)

    return { total, confirmed, pending, cancelled, totalRevenue }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">{t("Загружаем бронирования...")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{t(`Ошибка загрузки бронирований: ${error}`)}</p>
        <Button onClick={fetchBookings} className="mt-4">
          {t("Повторить попытку")}
        </Button>
      </div>
    )
  }

  const stats = getBookingStats()

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t("Управление бронированиями")}</h2>
          <p className="text-gray-600">{t("Просмотр и управление всеми бронированиями")}</p>
        </div>
        <Button onClick={fetchBookings} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          {t("Обновить")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <p className="text-sm text-blue-700">{t("Всего бронирований")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold text-green-900">{stats.confirmed}</div>
                <p className="text-sm text-green-700">{t("Подтверждено")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                <p className="text-sm text-yellow-700">{t("Ожидает")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold text-red-900">{stats.cancelled}</div>
                <p className="text-sm text-red-700">{t("Отменено")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">₽{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-purple-700">{t("Общая выручка")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("Поиск по клиенту, туру или ID...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("Фильтр по статусу")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("Все статусы")}</SelectItem>
            <SelectItem value="pending">{t("Ожидает")}</SelectItem>
            <SelectItem value="confirmed">{t("Подтверждено")}</SelectItem>
            <SelectItem value="cancelled">{t("Отменено")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="text-2xl font-semibold mb-4">
            {searchTerm || statusFilter !== "all"
              ? t("Бронирования не найдены.")
              : t("Нет бронирований для отображения.")}
          </CardTitle>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? t("Попробуйте изменить критерии поиска.")
              : t("Как только пользователи забронируют туры, они появятся здесь.")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                  {/* Booking Info */}
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {language === "ru" ? booking.tours?.title_ru : booking.tours?.title_en}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <strong>{t("ID")}:</strong> {booking.id.slice(0, 8)}...
                      </p>
                      <p className="flex items-center gap-2">
                        <strong>{t("Клиент")}:</strong> {booking.users?.full_name || t("Неизвестно")}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <strong>{t("Людей")}:</strong> {booking.total_people} ({t("детей")}: {booking.children_count})
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <strong>{t("Цена")}:</strong> {booking.total_price.toLocaleString()} ₽
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <strong>{t("Дата")}:</strong>{" "}
                        {new Date(booking.created_at).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-center space-y-3">
                    {getStatusBadge(booking.status)}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingBookingId(editingBookingId === booking.id ? null : booking.id)}
                        disabled={updatingBookingId === booking.id}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingBookingId === booking.id && (
                      <Select
                        value={booking.status}
                        onValueChange={(value) => handleStatusChange(booking.id, value)}
                        disabled={updatingBookingId === booking.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("Ожидает")}</SelectItem>
                          <SelectItem value="confirmed">{t("Подтверждено")}</SelectItem>
                          <SelectItem value="cancelled">{t("Отменено")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {updatingBookingId === booking.id && <LoadingSpinner />}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {booking.users?.email || t("Не указан")}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {booking.users?.phone || t("Не указан")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t("Подробнее")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t("Детали бронирования")}</DialogTitle>
                          <DialogDescription>{t("Полная информация о бронировании и клиенте")}</DialogDescription>
                        </DialogHeader>
                        {selectedBooking && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">{t("Информация о туре")}</h4>
                              <p className="text-sm">
                                {language === "ru" ? selectedBooking.tours?.title_ru : selectedBooking.tours?.title_en}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{t("Контакты клиента")}</h4>
                              <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {selectedBooking.users?.email || t("Не указан")}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {selectedBooking.users?.phone || t("Не указан")}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{t("Детали бронирования")}</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p>
                                  <strong>{t("Взрослых")}:</strong>{" "}
                                  {selectedBooking.total_people - selectedBooking.children_count}
                                </p>
                                <p>
                                  <strong>{t("Детей")}:</strong> {selectedBooking.children_count}
                                </p>
                                <p>
                                  <strong>{t("Итого")}:</strong> {selectedBooking.total_price.toLocaleString()} ₽
                                </p>
                                <p>
                                  <strong>{t("Статус")}:</strong> {getStatusBadge(selectedBooking.status)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
