"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/components/toast-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  Users,
  Eye,
  Check,
  X,
  MessageSquare
} from "lucide-react"

interface Booking {
  id: string
  user_id: string
  tour_id: string
  total_people: number
  children_count: number
  total_price: number
  status: string
  created_at: string
  contact_phone?: string
  contact_name?: string
  notes?: string
  booking_date?: string
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

export default function AdminBookingsTab() {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const text = {
    ru: {
      title: "Управление заказами",
      search: "Поиск по имени или email...",
      allStatuses: "Все статусы",
      pending: "Ожидает",
      confirmed: "Подтвержден",
      cancelled: "Отменен",
      people: "чел.",
      children: "детей",
      confirm: "Подтвердить",
      cancel: "Отменить",
      view: "Просмотр",
      statusUpdated: "Статус обновлен",
      error: "Ошибка",
      noBookings: "Заказы не найдены",
      bookingDetails: "Детали заказа",
      tour: "Тур",
      customer: "Клиент",
      contactPhone: "Телефон для связи",
      contactName: "Контактное имя",
      preferredDate: "Желаемая дата",
      notes: "Примечания",
      totalPrice: "Сумма заказа",
      createdAt: "Дата заявки",
      close: "Закрыть",
    },
    en: {
      title: "Order Management",
      search: "Search by name or email...",
      allStatuses: "All statuses",
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      people: "ppl.",
      children: "children",
      confirm: "Confirm",
      cancel: "Cancel",
      view: "View",
      statusUpdated: "Status updated",
      error: "Error",
      noBookings: "No bookings found",
      bookingDetails: "Booking Details",
      tour: "Tour",
      customer: "Customer",
      contactPhone: "Contact Phone",
      contactName: "Contact Name",
      preferredDate: "Preferred Date",
      notes: "Notes",
      totalPrice: "Total Price",
      createdAt: "Created At",
      close: "Close",
    }
  }

  const t = text[language]

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/bookings", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (booking) => {
          const name = (booking.users?.full_name || "").toLowerCase()
          const email = (booking.users?.email || "").toLowerCase()
          const contactName = (booking.contact_name || "").toLowerCase()
          return name.includes(term) || email.includes(term) || contactName.includes(term)
        }
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId)
    try {
      const response = await fetch("/api/admin/bookings/update-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      })

      if (response.ok) {
        showToast(t.statusUpdated, "success")
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? { ...booking, status: newStatus } : booking
          )
        )
      } else {
        showToast(t.error, "error")
      }
    } catch (error) {
      showToast(t.error, "error")
    } finally {
      setUpdating(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount) + " ₽"
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    const labels = {
      pending: t.pending,
      confirmed: t.confirmed,
      cancelled: t.cancelled,
    }
    return (
      <Badge className={styles[status as keyof typeof styles] || "bg-gray-100"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="confirmed">{t.confirmed}</SelectItem>
                <SelectItem value="cancelled">{t.cancelled}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t.noBookings}</div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {language === "ru" ? booking.tours?.title_ru : booking.tours?.title_en}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {booking.contact_name || booking.users?.full_name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {booking.contact_phone || booking.users?.phone || "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {booking.users?.email}
                        </p>
                        {booking.notes && (
                          <p className="flex items-center gap-2 text-amber-600">
                            <MessageSquare className="w-4 h-4" />
                            {booking.notes.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>{booking.total_people} {t.people}</span>
                        {booking.children_count > 0 && (
                          <span>({booking.children_count} {t.children})</span>
                        )}
                        <span className="font-bold text-green-600">{formatCurrency(booking.total_price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t.view}
                      </Button>
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(booking.id, "confirmed")}
                            disabled={updating === booking.id}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {t.confirm}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                            disabled={updating === booking.id}
                          >
                            <X className="w-4 h-4 mr-1" />
                            {t.cancel}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.bookingDetails}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-500">{t.tour}</h4>
                <p className="font-semibold">
                  {language === "ru" ? selectedBooking.tours?.title_ru : selectedBooking.tours?.title_en}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-500">{t.customer}</h4>
                  <p>{selectedBooking.users?.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.users?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">{t.contactPhone}</h4>
                  <p className="font-semibold text-green-600">
                    {selectedBooking.contact_phone || selectedBooking.users?.phone || "-"}
                  </p>
                </div>
              </div>
              {selectedBooking.contact_name && (
                <div>
                  <h4 className="font-medium text-gray-500">{t.contactName}</h4>
                  <p>{selectedBooking.contact_name}</p>
                </div>
              )}
              {selectedBooking.booking_date && (
                <div>
                  <h4 className="font-medium text-gray-500">{t.preferredDate}</h4>
                  <p>{new Date(selectedBooking.booking_date).toLocaleDateString("ru-RU")}</p>
                </div>
              )}
              {selectedBooking.notes && (
                <div>
                  <h4 className="font-medium text-gray-500">{t.notes}</h4>
                  <p className="bg-amber-50 p-3 rounded-lg text-sm">{selectedBooking.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-500">{t.totalPrice}</h4>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedBooking.total_price)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">{t.createdAt}</h4>
                  <p>{new Date(selectedBooking.created_at).toLocaleString("ru-RU")}</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setSelectedBooking(null)}>
                {t.close}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
