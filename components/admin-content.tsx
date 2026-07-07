"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/toast-provider"
import { useLanguage } from "@/components/language-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Shield,
  UserX,
  Check,
  X,
} from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  onlineUsers: number
  totalBookings: number
  totalRevenue: number
  averageCheck: number
}

interface User {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  created_at: string
}

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

interface Tour {
  id: string
  title_ru: string
  title_en: string
  description_ru: string
  description_en: string
  image_url: string | null
  price_per_person: number
  start_date: string | null
  end_date: string | null
  program_ru: string | null
  program_en: string | null
  included_ru: string | null
  included_en: string | null
  created_at: string
}

export default function AdminContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { t, language } = useLanguage()
  const { showToast } = useToast()

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    onlineUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageCheck: 0,
  })

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState("all")

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [bookingSearchTerm, setBookingSearchTerm] = useState("")
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all")

  // Tours state
  const [tours, setTours] = useState<Tour[]>([])
  const [showCreateTourForm, setShowCreateTourForm] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)

  // Loading states
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [toursLoading, setToursLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  // New tour form data
  const [newTourData, setNewTourData] = useState({
    title_ru: "",
    title_en: "",
    description_ru: "",
    description_en: "",
    image_url: "",
    price_per_person: 0,
    start_date: "",
    end_date: "",
    program_ru: "",
    program_en: "",
    included_ru: "",
    included_en: "",
  })

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAnalytics()
      fetchUsers()
      fetchBookings()
      fetchTours()

      // Set up real-time updates
      const interval = setInterval(() => {
        fetchAnalytics()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user])

  // Filter effects
  useEffect(() => {
    filterUsers()
  }, [users, userSearchTerm, userRoleFilter])

  useEffect(() => {
    filterBookings()
  }, [bookings, bookingSearchTerm, bookingStatusFilter])

  // Fetch functions
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics({
          totalUsers: data.totalUsers || 0,
          onlineUsers: data.onlineUsers || 0,
          totalBookings: data.totalBookings || 0,
          totalRevenue: data.totalRevenue || 0,
          averageCheck: data.averageOrderValue || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true)
      const response = await fetch("/api/admin/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const fetchTours = async () => {
    try {
      setToursLoading(true)
      const response = await fetch("/api/admin/tours")
      if (response.ok) {
        const data = await response.json()
        setTours(data.tours || [])
      }
    } catch (error) {
      console.error("Error fetching tours:", error)
    } finally {
      setToursLoading(false)
    }
  }

  // Filter functions
  const filterUsers = () => {
    let filtered = users

    if (userSearchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          (user.phone && user.phone.includes(userSearchTerm)),
      )
    }

    if (userRoleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === userRoleFilter)
    }

    setFilteredUsers(filtered)
  }

  const filterBookings = () => {
    let filtered = bookings

    if (bookingSearchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.users?.full_name.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
          booking.users?.email.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
          (language === "ru" ? booking.tours?.title_ru : booking.tours?.title_en)
            ?.toLowerCase()
            .includes(bookingSearchTerm.toLowerCase()),
      )
    }

    if (bookingStatusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === bookingStatusFilter)
    }

    setFilteredBookings(filtered)
  }

  // User management functions
  const handleUserRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        showToast(t("Роль пользователя обновлена!"), "success")
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      } else {
        showToast(t("Ошибка при обновлении роли"), "error")
      }
    } catch (error) {
      showToast(t("Произошла ошибка"), "error")
    } finally {
      setUpdating(null)
    }
  }

  const handleUserBan = async (userId: string) => {
    if (!confirm(t("Вы уверены, что хотите заблокировать этого пользователя?"))) return

    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        showToast(t("Пользователь заблокирован!"), "success")
        setUsers((prev) => prev.filter((user) => user.id !== userId))
      } else {
        showToast(t("Ошибка при блокировке пользователя"), "error")
      }
    } catch (error) {
      showToast(t("Произошла ошибка"), "error")
    } finally {
      setUpdating(null)
    }
  }

  // Booking management functions
  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId)
    try {
      const response = await fetch("/api/admin/bookings/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      })

      if (response.ok) {
        showToast(t("Статус бронирования обновлен!"), "success")
        setBookings((prev) =>
          prev.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)),
        )
      } else {
        showToast(t("Ошибка при обновлении статуса"), "error")
      }
    } catch (error) {
      showToast(t("Произошла ошибка"), "error")
    } finally {
      setUpdating(null)
    }
  }

  // Tour management functions
  const handleCreateTour = async () => {
    setUpdating("create-tour")
    try {
      const response = await fetch("/api/admin/tours/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTourData),
      })

      if (response.ok) {
        showToast(t("Тур успешно создан!"), "success")
        setNewTourData({
          title_ru: "",
          title_en: "",
          description_ru: "",
          description_en: "",
          image_url: "",
          price_per_person: 0,
          start_date: "",
          end_date: "",
          program_ru: "",
          program_en: "",
          included_ru: "",
          included_en: "",
        })
        setShowCreateTourForm(false)
        fetchTours()
      } else {
        showToast(t("Ошибка при создании тура"), "error")
      }
    } catch (error) {
      showToast(t("Произошла ошибка"), "error")
    } finally {
      setUpdating(null)
    }
  }

  const handleUpdateTour = async () => {
    if (!editingTour) return

    setUpdating(editingTour.id)
    try {
      const response = await fetch("/api/admin/tours/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId: editingTour.id, ...editingTour }),
      })

      if (response.ok) {
        showToast(t("Тур успешно обновлен!"), "success")
        setEditingTour(null)
        fetchTours()
      } else {
        showToast(t("Ошибка при обновлении тура"), "error")
      }
    } catch (error) {
      showToast(t("Произошла ошибка"), "error")
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm(t("Вы уверены, что хотите удалить этот тур?"))) return

    setUpdating(tourId)
    try {
      const response = await fetch("/api/admin/tours/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      })

      if (response.ok) {
        showToast(t("Тур успешно удален!"), "success")
        setTours((prev) => prev.filter((tour) => tour.id !== tourId))
      } else {
        showToast(t("Ошибка при удалении тура"), "error")
      }
    } catch (error) {
      showToast(t("Произошла ошибка"), "error")
    } finally {
      setUpdating(null)
    }
  }

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">{t("Подтверждено")}</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">{t("Ожидает")}</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">{t("Отменено")}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800">
            <Shield className="h-3 w-3 mr-1" />
            {t("Администратор")}
          </Badge>
        )
      case "user":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Users className="h-3 w-3 mr-1" />
            {t("Пользователь")}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("Панель администратора")}</h1>
        <p className="text-gray-600">{t("Управление системой и контент")}</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("Аналитика")}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("Пользователи")}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t("Бронирования")}
          </TabsTrigger>
          <TabsTrigger value="tours" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t("Туры")}
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">{t("Всего пользователей")}</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {analyticsLoading ? <LoadingSpinner /> : analytics.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-blue-700 flex items-center mt-1">
                  <Eye className="h-3 w-3 inline mr-1" />
                  {analytics.onlineUsers} {t("онлайн")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">{t("Всего бронирований")}</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {analyticsLoading ? <LoadingSpinner /> : analytics.totalBookings.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">{t("Общая выручка")}</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {analyticsLoading ? <LoadingSpinner /> : `₽${analytics.totalRevenue.toLocaleString()}`}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">{t("Средний чек")}</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {analyticsLoading ? <LoadingSpinner /> : `₽${analytics.averageCheck.toLocaleString()}`}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("Поиск по имени, email или телефону...")}
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("Фильтр по роли")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("Все роли")}</SelectItem>
                <SelectItem value="admin">{t("Администраторы")}</SelectItem>
                <SelectItem value="user">{t("Пользователи")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                      <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{user.full_name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone || t("Не указан")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("Зарегистрирован")}: {new Date(user.created_at).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        {getRoleBadge(user.role)}
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleUserRoleChange(user.id, value)}
                          disabled={updating === user.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">{t("Пользователь")}</SelectItem>
                            <SelectItem value="admin">{t("Администратор")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUserBan(user.id)}
                          disabled={updating === user.id || user.role === "admin"}
                          className="w-full"
                        >
                          {updating === user.id ? (
                            <LoadingSpinner />
                          ) : (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              {t("Заблокировать")}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("Поиск по клиенту или туру...")}
                value={bookingSearchTerm}
                onChange={(e) => setBookingSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
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

          {bookingsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                      <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {language === "ru" ? booking.tours?.title_ru : booking.tours?.title_en}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <strong>{t("Клиент")}:</strong> {booking.users?.full_name}
                          </p>
                          <p>
                            <strong>{t("Людей")}:</strong> {booking.total_people} ({t("детей")}:{" "}
                            {booking.children_count})
                          </p>
                          <p>
                            <strong>{t("Цена")}:</strong> ₽{booking.total_price.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-2">{getStatusBadge(booking.status)}</div>

                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {booking.users?.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {booking.users?.phone || t("Не указан")}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingStatusChange(booking.id, "confirmed")}
                          disabled={updating === booking.id || booking.status === "confirmed"}
                          className="w-full"
                        >
                          {updating === booking.id ? (
                            <LoadingSpinner />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              {t("Одобрить")}
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBookingStatusChange(booking.id, "cancelled")}
                          disabled={updating === booking.id || booking.status === "cancelled"}
                          className="w-full"
                        >
                          {updating === booking.id ? (
                            <LoadingSpinner />
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              {t("Отменить")}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tours Tab */}
        <TabsContent value="tours" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t("Управление турами")}</h2>
            <Button onClick={() => setShowCreateTourForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              {t("Создать тур")}
            </Button>
          </div>

          {/* Create Tour Form */}
          {showCreateTourForm && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("Создать новый тур")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder={t("Название (рус.)")}
                    value={newTourData.title_ru}
                    onChange={(e) => setNewTourData({ ...newTourData, title_ru: e.target.value })}
                  />
                  <Input
                    placeholder={t("Название (англ.)")}
                    value={newTourData.title_en}
                    onChange={(e) => setNewTourData({ ...newTourData, title_en: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    placeholder={t("Описание (рус.)")}
                    value={newTourData.description_ru}
                    onChange={(e) => setNewTourData({ ...newTourData, description_ru: e.target.value })}
                    rows={3}
                  />
                  <Textarea
                    placeholder={t("Описание (англ.)")}
                    value={newTourData.description_en}
                    onChange={(e) => setNewTourData({ ...newTourData, description_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <Input
                  placeholder={t("URL изображения")}
                  value={newTourData.image_url}
                  onChange={(e) => setNewTourData({ ...newTourData, image_url: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    placeholder={t("Цена за человека")}
                    value={newTourData.price_per_person}
                    onChange={(e) => setNewTourData({ ...newTourData, price_per_person: Number(e.target.value) })}
                  />
                  <Input
                    type="date"
                    placeholder={t("Дата начала")}
                    value={newTourData.start_date}
                    onChange={(e) => setNewTourData({ ...newTourData, start_date: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder={t("Дата окончания")}
                    value={newTourData.end_date}
                    onChange={(e) => setNewTourData({ ...newTourData, end_date: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTour} disabled={updating === "create-tour"}>
                    {updating === "create-tour" ? <LoadingSpinner /> : t("Создать тур")}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateTourForm(false)}>
                    {t("Отмена")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {toursLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid gap-4">
              {tours.map((tour) => (
                <Card key={tour.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {editingTour?.id === tour.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder={t("Название (рус.)")}
                            value={editingTour.title_ru}
                            onChange={(e) => setEditingTour({ ...editingTour, title_ru: e.target.value })}
                          />
                          <Input
                            placeholder={t("Название (англ.)")}
                            value={editingTour.title_en}
                            onChange={(e) => setEditingTour({ ...editingTour, title_en: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Textarea
                            placeholder={t("Описание (рус.)")}
                            value={editingTour.description_ru}
                            onChange={(e) => setEditingTour({ ...editingTour, description_ru: e.target.value })}
                            rows={3}
                          />
                          <Textarea
                            placeholder={t("Описание (англ.)")}
                            value={editingTour.description_en}
                            onChange={(e) => setEditingTour({ ...editingTour, description_en: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Input
                          type="number"
                          placeholder={t("Цена за человека")}
                          value={editingTour.price_per_person}
                          onChange={(e) => setEditingTour({ ...editingTour, price_per_person: Number(e.target.value) })}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateTour} disabled={updating === editingTour.id}>
                            {updating === editingTour.id ? <LoadingSpinner /> : t("Сохранить")}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingTour(null)}>
                            {t("Отмена")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                        <div className="lg:col-span-2">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {language === "ru" ? tour.title_ru : tour.title_en}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {language === "ru" ? tour.description_ru : tour.description_en}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {tour.price_per_person.toLocaleString()} ₽
                            </span>
                            {tour.start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(tour.start_date).toLocaleDateString("ru-RU")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Badge
                            variant={
                              tour.start_date && new Date(tour.start_date) > new Date() ? "default" : "secondary"
                            }
                          >
                            {tour.start_date && new Date(tour.start_date) > new Date() ? t("Активный") : t("Завершен")}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingTour(tour)} className="w-full">
                            <Edit3 className="h-4 w-4 mr-2" />
                            {t("Редактировать")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTour(tour.id)}
                            disabled={updating === tour.id}
                            className="w-full"
                          >
                            {updating === tour.id ? (
                              <LoadingSpinner />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("Удалить")}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
