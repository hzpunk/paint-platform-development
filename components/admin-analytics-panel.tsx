"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./loading-spinner";
import { useLanguage } from "./language-provider";
import { ArrowUpRight, BarChart3, DollarSign, User } from "lucide-react";

interface AnalyticsResponse {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function AdminAnalyticsPanel() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load analytics");
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Не удалось загрузить аналитику");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Аналитика</h1>
          <p className="text-sm text-muted-foreground">
            Основные метрики и общий доход.
          </p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
          {loading ? "Обновление..." : "Обновить"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-destructive">
          {error}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-14">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/70">
            <CardHeader className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Пользователи</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                {analytics.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Всего зарегистрированных")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <CardTitle>Заказы</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                {analytics.totalOrders.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Всего заказов")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <CardTitle>Выручка</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                ₽{analytics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Общая сумма")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="flex items-center gap-3">
              <ArrowUpRight className="h-5 w-5 text-sky-600" />
              <CardTitle>Средний чек</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">
                ₽{analytics.averageOrderValue.toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("В среднем за заказ")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
