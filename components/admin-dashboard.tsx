"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Download,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
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
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { useLanguage } from "@/components/language-provider";
import { LoadingSpinner } from "./loading-spinner";

interface AnalyticsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  hzcompanyCommission: number;
  onlineUsers: number;
  bookingsLast7Days: number;
  revenueChangePercent: number;
  averageOrderValue: number;
  recentBookings: Array<{
    id: string;
    user_name: string;
    tour_title: string;
    total_price: number;
    created_at: string;
    status: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  bookingsByStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  dailyNewUsers: Array<{
    date: string;
    count: number;
  }>;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    hzcompanyCommission: 0,
    onlineUsers: 0,
    bookingsLast7Days: 0,
    revenueChangePercent: 0,
    averageOrderValue: 0,
    recentBookings: [],
    monthlyRevenue: [],
    userGrowth: [],
    bookingsByStatus: [],
    dailyNewUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics");

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics({
        totalUsers: data.totalUsers || 0,
        totalBookings: data.totalBookings || 0,
        totalRevenue: data.totalRevenue || 0,
        hzcompanyCommission: data.hzcompanyCommission || 0,
        onlineUsers: data.onlineUsers || 0,
        bookingsLast7Days: data.bookingsLast7Days || 0,
        revenueChangePercent: data.revenueChangePercent || 0,
        averageOrderValue: data.averageOrderValue || 0,
        recentBookings: data.recentBookings || [],
        monthlyRevenue: data.monthlyRevenue || [],
        userGrowth: data.userGrowth || [],
        bookingsByStatus: data.bookingsByStatus || [],
        dailyNewUsers: data.dailyNewUsers || [],
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(t("Ошибка загрузки аналитики"));
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsData = async () => {
    try {
      const csvContent = [
        ["Метрика", "Значение"],
        [t("Всего пользователей"), analytics.totalUsers],
        [t("Всего бронирований"), analytics.totalBookings],
        [t("Общая выручка"), analytics.totalRevenue],
        [t("Комиссия Hzcompany"), analytics.hzcompanyCommission],
        [t("Пользователей онлайн"), analytics.onlineUsers],
        [t("Бронирований за 7 дней"), analytics.bookingsLast7Days],
        [t("Средний чек"), analytics.averageOrderValue],
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const getChangeIcon = (percent: number) => {
    if (percent > 0) return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (percent < 0) return <ArrowDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-600" />;
  };

  const getChangeColor = (percent: number) => {
    if (percent > 0) return "text-green-600";
    if (percent < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">{t("Загружаем данные...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          {t("Попробовать снова")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("Панель управления")}
          </h1>
          <p className="text-gray-600">
            {t("Обзор ключевых показателей системы")}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            {t("Обновить")}
          </Button>
          <Button onClick={exportAnalyticsData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("Экспорт")}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Users */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              {t("Всего пользователей")}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {analytics.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 flex items-center mt-1">
              <Eye className="h-3 w-3 inline mr-1" />
              {analytics.onlineUsers} {t("онлайн")}
            </p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              {t("Всего бронирований")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {analytics.totalBookings.toLocaleString()}
            </div>
            <p className="text-xs text-green-700 flex items-center mt-1">
              <Activity className="h-3 w-3 inline mr-1" />+
              {analytics.bookingsLast7Days} {t("за 7 дней")}
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              {t("Общая выручка")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ₽{analytics.totalRevenue.toLocaleString()}
            </div>
            <p
              className={`text-xs flex items-center mt-1 ${getChangeColor(analytics.revenueChangePercent)}`}
            >
              {getChangeIcon(analytics.revenueChangePercent)}
              {Math.abs(analytics.revenueChangePercent).toFixed(1)}%{" "}
              {t("за месяц")}
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              {t("Средний чек")}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              ₽{analytics.averageOrderValue.toLocaleString()}
            </div>
            <p className="text-xs text-orange-700">
              {t("На одно бронирование")}
            </p>
          </CardContent>
        </Card>

        {/* Hzcompany Commission */}
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              {t("Комиссия Hzcompany")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              ₽{analytics.hzcompanyCommission.toLocaleString()}
            </div>
            <p className="text-xs text-amber-700">{t("20% от выручки")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("Обзор")}</TabsTrigger>
          <TabsTrigger value="revenue">{t("Выручка")}</TabsTrigger>
          <TabsTrigger value="users">{t("Пользователи")}</TabsTrigger>
          <TabsTrigger value="bookings">{t("Бронирования")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  {t("Рост пользователей")}
                </CardTitle>
                <CardDescription>
                  {t("Количество новых пользователей по дням")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("ru-RU", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("ru-RU")
                      }
                      formatter={(value) => [value, t("Новых пользователей")]}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bookings by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  {t("Статус бронирований")}
                </CardTitle>
                <CardDescription>
                  {t("Распределение по статусам")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.bookingsByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, count, percent }) =>
                        `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {analytics.bookingsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, t("Количество")]}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                {t("Месячная выручка и бронирования")}
              </CardTitle>
              <CardDescription>
                {t("Доходы и количество бронирований по месяцам")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analytics.monthlyRevenue}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? `₽${value.toLocaleString()}` : value,
                      name === "revenue" ? t("Выручка") : t("Бронирования"),
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#8b5cf6"
                    name={t("Выручка (₽)")}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="bookings"
                    fill="#10b981"
                    name={t("Бронирования")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {t("Ежедневные новые пользователи")}
              </CardTitle>
              <CardDescription>
                {t("Количество регистраций по дням")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.dailyNewUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("ru-RU", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("ru-RU")
                    }
                    formatter={(value) => [value, t("Новых пользователей")]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                {t("Последние бронирования")}
              </CardTitle>
              <CardDescription>{t("Недавние заказы туров")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analytics.recentBookings || [])
                  .slice(0, 10)
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {booking.user_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.tour_title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString(
                            "ru-RU",
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ₽{booking.total_price.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="mt-1"
                        >
                          {booking.status === "confirmed"
                            ? t("Подтвержден")
                            : booking.status === "pending"
                              ? t("Ожидает")
                              : t("Отменен")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                {(analytics.recentBookings || []).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("Нет недавних бронирований")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
