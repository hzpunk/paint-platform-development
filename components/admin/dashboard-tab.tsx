"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/components/toast-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Wallet,
  Check,
  X,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"

type Period = "day" | "week" | "month" | "quarter" | "year"

interface DashboardData {
  totalRevenue: number
  platformRevenue: number
  totalUsers: number
  totalBookings: number
  onlineUsers: number
  revenueChange: number
  usersChange: number
  bookingsChange: number
  recentBookings: Array<{
    id: string
    user_name: string
    tour_title: string
    total_price: number
    status: string
    created_at: string
  }>
  chartData: Array<{
    date: string
    revenue: number
    bookings: number
    markupRevenue: number
  }>
}

export default function AdminDashboardTab() {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [period, setPeriod] = useState<Period>("week")
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)

  const text = {
    ru: {
      totalRevenue: "Общая выручка",
      platformRevenue: "Выручка платформы",
      totalUsers: "Пользователей",
      totalBookings: "Заказов",
      onlineNow: "онлайн сейчас",
      revenueChart: "Динамика выручки",
      recentOrders: "Последние заказы",
      refresh: "Обновить",
      period: "Период",
      day: "День",
      week: "Неделя",
      month: "Месяц",
      quarter: "Квартал",
      year: "Год",
      pending: "Ожидает",
      confirmed: "Подтвержден",
      cancelled: "Отменен",
      noData: "Нет данных",
      revenue: "Выручка",
      bookings: "Заказы",
      markup: "Наценка",
      confirmBooking: "Подтвердить",
      cancelBooking: "Отменить",
      statusUpdated: "Статус обновлён",
      error: "Ошибка",
    },
    en: {
      totalRevenue: "Total Revenue",
      platformRevenue: "Platform Revenue",
      totalUsers: "Users",
      totalBookings: "Orders",
      onlineNow: "online now",
      revenueChart: "Revenue Dynamics",
      recentOrders: "Recent Orders",
      refresh: "Refresh",
      period: "Period",
      day: "Day",
      week: "Week",
      month: "Month",
      quarter: "Quarter",
      year: "Year",
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      noData: "No data",
      revenue: "Revenue",
      bookings: "Bookings",
      markup: "Markup",
      confirmBooking: "Confirm",
      cancelBooking: "Cancel",
      statusUpdated: "Status updated",
      error: "Error",
    }
  }

  const t = text[language]

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async (opts?: { skipLoading?: boolean }) => {
    if (!opts?.skipLoading) setLoading(true)
    try {
      const response = await fetch(`/api/admin/dashboard?period=${period}`, { credentials: "include" })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      if (!opts?.skipLoading) setLoading(false)
    }
  }

  const handleRecentBookingStatus = async (bookingId: string, status: "confirmed" | "cancelled") => {
    setUpdatingBookingId(bookingId)
    try {
      const response = await fetch("/api/admin/bookings/update-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      })
      if (response.ok) {
        showToast(t.statusUpdated, "success")
        await fetchDashboardData({ skipLoading: true })
      } else {
        showToast(t.error, "error")
      }
    } catch {
      showToast(t.error, "error")
    } finally {
      setUpdatingBookingId(null)
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
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">{t.period}:</span>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t.day}</SelectItem>
              <SelectItem value="week">{t.week}</SelectItem>
              <SelectItem value="month">{t.month}</SelectItem>
              <SelectItem value="quarter">{t.quarter}</SelectItem>
              <SelectItem value="year">{t.year}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={fetchDashboardData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t.refresh}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">{t.totalRevenue}</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(data?.totalRevenue || 0)}</div>
            <div className="flex items-center mt-1 text-xs">
              {(data?.revenueChange || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={(data?.revenueChange || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(data?.revenueChange || 0).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">{t.platformRevenue}</CardTitle>
            <Wallet className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(data?.platformRevenue || 0)}</div>
            <p className="text-xs text-purple-700 mt-1">{t.markup}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">{t.totalUsers}</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{data?.totalUsers || 0}</div>
            <p className="text-xs text-blue-700 mt-1 flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {data?.onlineUsers || 0} {t.onlineNow}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">{t.totalBookings}</CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{data?.totalBookings || 0}</div>
            <div className="flex items-center mt-1 text-xs">
              {(data?.bookingsChange || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={(data?.bookingsChange || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(data?.bookingsChange || 0).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.revenueChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, dataKey: string | number) => {
                    const key = String(dataKey)
                    const label = key === "revenue" ? t.revenue : key === "markupRevenue" ? t.markup : key
                    return [formatCurrency(Number(value)), label]
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name={t.revenue}
                />
                <Line 
                  type="monotone" 
                  dataKey="markupRevenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name={t.markup}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.bookings}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#f59e0b" name={t.bookings} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t.recentOrders}</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentBookings && data.recentBookings.length > 0 ? (
            <div className="space-y-3">
              {data.recentBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.user_name}</p>
                    <p className="text-sm text-gray-600">{booking.tour_title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-bold text-green-600">{formatCurrency(booking.total_price)}</p>
                    {getStatusBadge(booking.status)}
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 bg-green-600 hover:bg-green-700"
                          disabled={updatingBookingId === booking.id}
                          onClick={() => handleRecentBookingStatus(booking.id, "confirmed")}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {t.confirmBooking}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          disabled={updatingBookingId === booking.id}
                          onClick={() => handleRecentBookingStatus(booking.id, "cancelled")}
                        >
                          <X className="w-3 h-3 mr-1" />
                          {t.cancelBooking}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">{t.noData}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
