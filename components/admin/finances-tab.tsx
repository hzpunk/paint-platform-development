"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
  RefreshCw,
  Download
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"

type Period = "week" | "month" | "quarter" | "year"

interface FinanceData {
  totalRevenue: number
  platformRevenue: number
  operatorRevenue: number
  averageOrderValue: number
  revenueChange: number
  platformRevenueChange: number
  totalOrders: number
  confirmedOrders: number
  conversionRate: number
  revenueByDay: Array<{
    date: string
    total: number
    platform: number
    operator: number
  }>
  revenueByTour: Array<{
    name: string
    value: number
    color: string
  }>
  monthlyComparison: Array<{
    month: string
    current: number
    previous: number
  }>
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AdminFinancesTab() {
  const { language } = useLanguage()
  const [period, setPeriod] = useState<Period>("month")
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)

  const text = {
    ru: {
      title: "Финансовая отчетность",
      totalRevenue: "Общая выручка",
      platformRevenue: "Доход платформы",
      operatorRevenue: "Доход операторов",
      averageOrder: "Средний чек",
      orders: "Заказов",
      confirmed: "подтверждено",
      conversion: "Конверсия",
      revenueChart: "Динамика выручки",
      revenueByTour: "Выручка по турам",
      comparison: "Сравнение периодов",
      period: "Период",
      week: "Неделя",
      month: "Месяц",
      quarter: "Квартал",
      year: "Год",
      refresh: "Обновить",
      export: "Экспорт",
      total: "Общая",
      platform: "Платформа",
      operator: "Операторы",
      current: "Текущий",
      previous: "Предыдущий",
    },
    en: {
      title: "Financial Reports",
      totalRevenue: "Total Revenue",
      platformRevenue: "Platform Revenue",
      operatorRevenue: "Operator Revenue",
      averageOrder: "Average Order",
      orders: "Orders",
      confirmed: "confirmed",
      conversion: "Conversion",
      revenueChart: "Revenue Dynamics",
      revenueByTour: "Revenue by Tour",
      comparison: "Period Comparison",
      period: "Period",
      week: "Week",
      month: "Month",
      quarter: "Quarter",
      year: "Year",
      refresh: "Refresh",
      export: "Export",
      total: "Total",
      platform: "Platform",
      operator: "Operators",
      current: "Current",
      previous: "Previous",
    }
  }

  const t = text[language]

  useEffect(() => {
    fetchFinanceData()
  }, [period])

  const fetchFinanceData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/finances?period=${period}`, { credentials: "include" })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Error fetching finance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!data) return

    const csvContent = [
      ["Метрика", "Значение"],
      [t.totalRevenue, data.totalRevenue],
      [t.platformRevenue, data.platformRevenue],
      [t.operatorRevenue, data.operatorRevenue],
      [t.averageOrder, data.averageOrderValue],
      [t.orders, data.totalOrders],
      [t.conversion, data.conversionRate + "%"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finances-${period}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
        <h2 className="text-2xl font-bold">{t.title}</h2>
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
          <Button variant="outline" onClick={fetchFinanceData} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
          <Button variant="outline" onClick={exportData} size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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
            <div className="flex items-center mt-1 text-xs">
              {(data?.platformRevenueChange || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={(data?.platformRevenueChange || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(data?.platformRevenueChange || 0).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">{t.operatorRevenue}</CardTitle>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(data?.operatorRevenue || 0)}</div>
            <p className="text-xs text-blue-700 mt-1">
              {data?.totalOrders || 0} {t.orders}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">{t.averageOrder}</CardTitle>
            <PiggyBank className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(data?.averageOrderValue || 0)}</div>
            <p className="text-xs text-orange-700 mt-1">
              {t.conversion}: {(data?.conversionRate || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>{t.revenueChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      total: t.total,
                      platform: t.platform,
                      operator: t.operator
                    }
                    return [formatCurrency(value), labels[name] || name]
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                  name={t.total}
                />
                <Area 
                  type="monotone" 
                  dataKey="platform" 
                  stackId="2"
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  name={t.platform}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Tour */}
        <Card>
          <CardHeader>
            <CardTitle>{t.revenueByTour}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.revenueByTour || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.revenueByTour || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Period Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>{t.comparison}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.monthlyComparison || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#10b981" 
                strokeWidth={2}
                name={t.current}
              />
              <Line 
                type="monotone" 
                dataKey="previous" 
                stroke="#9ca3af" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name={t.previous}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
