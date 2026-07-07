"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin,
  Calendar,
  RefreshCw,
  Target,
  Activity
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
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

type Period = "week" | "month" | "quarter" | "year"

interface AnalyticsData {
  // Traffic metrics
  totalVisits: number
  uniqueVisitors: number
  pageViews: number
  bounceRate: number
  avgSessionDuration: number
  
  // User metrics
  newUsers: number
  returningUsers: number
  usersByDevice: Array<{ device: string; count: number; color: string }>
  
  // Booking metrics
  totalBookings: number
  conversionRate: number
  avgBookingValue: number
  bookingsByStatus: Array<{ status: string; count: number; color: string }>
  
  // Tour metrics
  topTours: Array<{ name: string; bookings: number; revenue: number }>
  tourPopularity: Array<{ name: string; value: number }>
  
  // Time series
  visitsByDay: Array<{ date: string; visits: number; uniqueVisitors: number }>
  bookingsByDay: Array<{ date: string; bookings: number; revenue: number }>
  
  // Performance metrics
  performanceMetrics: Array<{ metric: string; value: number; fullMark: number }>
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AdminAnalyticsTab() {
  const { language } = useLanguage()
  const [period, setPeriod] = useState<Period>("month")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const text = {
    ru: {
      title: "Углубленная аналитика",
      traffic: "Трафик",
      totalVisits: "Всего посещений",
      uniqueVisitors: "Уникальных посетителей",
      pageViews: "Просмотров страниц",
      bounceRate: "Показатель отказов",
      avgSession: "Ср. время сессии",
      userAnalytics: "Аналитика пользователей",
      newUsers: "Новых пользователей",
      returningUsers: "Вернувшихся",
      usersByDevice: "По устройствам",
      bookingAnalytics: "Аналитика бронирований",
      conversionRate: "Конверсия",
      avgBooking: "Средний чек",
      bookingsByStatus: "По статусам",
      tourAnalytics: "Аналитика туров",
      topTours: "Популярные туры",
      visitsDynamics: "Динамика посещений",
      bookingsDynamics: "Динамика бронирований",
      performance: "Показатели эффективности",
      period: "Период",
      week: "Неделя",
      month: "Месяц",
      quarter: "Квартал",
      year: "Год",
      refresh: "Обновить",
      visits: "Посещения",
      unique: "Уникальные",
      bookings: "Бронирования",
      revenue: "Выручка",
      desktop: "Десктоп",
      mobile: "Мобильные",
      tablet: "Планшеты",
      pending: "Ожидает",
      confirmed: "Подтвержден",
      cancelled: "Отменен",
      minutes: "мин",
    },
    en: {
      title: "Deep Analytics",
      traffic: "Traffic",
      totalVisits: "Total Visits",
      uniqueVisitors: "Unique Visitors",
      pageViews: "Page Views",
      bounceRate: "Bounce Rate",
      avgSession: "Avg. Session",
      userAnalytics: "User Analytics",
      newUsers: "New Users",
      returningUsers: "Returning",
      usersByDevice: "By Device",
      bookingAnalytics: "Booking Analytics",
      conversionRate: "Conversion",
      avgBooking: "Avg. Booking",
      bookingsByStatus: "By Status",
      tourAnalytics: "Tour Analytics",
      topTours: "Top Tours",
      visitsDynamics: "Visits Dynamics",
      bookingsDynamics: "Bookings Dynamics",
      performance: "Performance Metrics",
      period: "Period",
      week: "Week",
      month: "Month",
      quarter: "Quarter",
      year: "Year",
      refresh: "Refresh",
      visits: "Visits",
      unique: "Unique",
      bookings: "Bookings",
      revenue: "Revenue",
      desktop: "Desktop",
      mobile: "Mobile",
      tablet: "Tablet",
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      minutes: "min",
    }
  }

  const t = text[language]

  useEffect(() => {
    fetchAnalyticsData()
  }, [period])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics/detailed?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount) + " ₽"
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          {t.title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t.period}:</span>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t.week}</SelectItem>
                <SelectItem value="month">{t.month}</SelectItem>
                <SelectItem value="quarter">{t.quarter}</SelectItem>
                <SelectItem value="year">{t.year}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={fetchAnalyticsData} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Traffic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{(data?.totalVisits || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600">{t.totalVisits}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{(data?.uniqueVisitors || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600">{t.uniqueVisitors}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{(data?.conversionRate || 0).toFixed(1)}%</p>
              <p className="text-sm text-gray-600">{t.conversionRate}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">{(data?.bounceRate || 0).toFixed(1)}%</p>
              <p className="text-sm text-gray-600">{t.bounceRate}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto text-pink-600 mb-2" />
              <p className="text-2xl font-bold">{data?.avgSessionDuration || 0} {t.minutes}</p>
              <p className="text-sm text-gray-600">{t.avgSession}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Dynamics */}
        <Card>
          <CardHeader>
            <CardTitle>{t.visitsDynamics}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.visitsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name={t.visits}
                />
                <Line 
                  type="monotone" 
                  dataKey="uniqueVisitors" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name={t.unique}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Dynamics */}
        <Card>
          <CardHeader>
            <CardTitle>{t.bookingsDynamics}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.bookingsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number, name: string) => 
                  name === "revenue" ? formatCurrency(value) : value
                }/>
                <Legend />
                <Bar yAxisId="left" dataKey="bookings" fill="#f59e0b" name={t.bookings} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" name={t.revenue} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Device */}
        <Card>
          <CardHeader>
            <CardTitle>{t.usersByDevice}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.usersByDevice || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.usersByDevice || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings by Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t.bookingsByStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.bookingsByStatus || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.bookingsByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>{t.performance}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={data?.performanceMetrics || []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Tours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t.topTours}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.topTours && data.topTours.length > 0 ? (
            <div className="space-y-3">
              {data.topTours.map((tour, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-800 rounded-full font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{tour.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-600">{tour.bookings} {t.bookings}</span>
                    <span className="font-semibold text-green-600">{formatCurrency(tour.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
