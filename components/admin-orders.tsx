"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useToast } from "./toast-provider";
import { LoadingSpinner } from "./loading-spinner";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  PackageCheck,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { HZCOMPANY_COMMISSION_RATE } from "@/lib/productPricing";
import { PaintCan } from "@/components/product/paint-can";

interface OrderItem {
  id: string;
  name: string;
  volume: number;
  price: number;
  qty: number;
  productId: string | null;
  color: string | null;
  ral: string | null;
}

interface AuditEntry {
  id: string;
  actor: string;
  from: string;
  to: string;
  at: string;
}

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  cancellationReason?: string | null;
  items?: OrderItem[];
  audit?: AuditEntry[];
}

const normalizeStatus = (status: string | null | undefined) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "new" || normalized === "новый") return "new";
  if (normalized === "pending" || normalized === "в обработке")
    return "pending";
  if (normalized === "collected" || normalized === "собран") return "collected";
  if (normalized === "confirmed" || normalized === "подтвержден")
    return "confirmed";
  if (
    normalized === "completed" ||
    normalized === "завершен" ||
    normalized === "завершён" ||
    normalized === "оплачен"
  )
    return "completed";
  if (
    normalized === "cancelled" ||
    normalized === "отменён" ||
    normalized === "отменен"
  )
    return "cancelled";
  if (normalized === "refunded" || normalized === "возвращён")
    return "refunded";
  return normalized;
};

const statusLabel: Record<string, string> = {
  new: "Новый",
  pending: "В обработке",
  collected: "Собран",
  confirmed: "Подтвержден",
  cancelled: "Отменён",
  refunded: "Возвращён",
  completed: "Завершён",
};

const getStatusVariant = (status: string | null | undefined) => {
  switch (normalizeStatus(status)) {
    case "new":
      return "default";
    case "pending":
      return "secondary";
    case "collected":
      return "outline";
    case "confirmed":
      return "success";
    case "completed":
      return "success";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusCardClassName = (status: string | null | undefined) => {
  switch (normalizeStatus(status)) {
    case "collected":
      return "border-amber-300 bg-amber-50/70 shadow-sm";
    case "completed":
      return "border-emerald-300 bg-emerald-50/70 shadow-sm";
    default:
      return "";
  }
};

const getStatusIcon = (status: string | null | undefined) => {
  switch (normalizeStatus(status)) {
    case "collected":
      return <PackageCheck className="h-4 w-4" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return null;
  }
};

const sortOrders = (orders: AdminOrder[]) => {
  const orderPriority: Record<string, number> = {
    new: 0,
    pending: 1,
    collected: 2,
    confirmed: 3,
    completed: 4,
    paid: 4,
    cancelled: 5,
    refunded: 5,
  };

  return [...orders].sort((a, b) => {
    const aPriority = orderPriority[normalizeStatus(a.status)] ?? 99;
    const bPriority = orderPriority[normalizeStatus(b.status)] ?? 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/orders", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load orders");
      const data = await response.json();
      setOrders(sortOrders(data || []));
    } catch (error) {
      console.error(error);
      showToast("Не удалось загрузить заказы", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const openDetails = async (order: AdminOrder) => {
    setSelectedOrder(order);
    setDetailsLoading(true);
    setDetailsModalOpen(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load order details");
      }
      const detailedOrder = await response.json();
      setSelectedOrder(detailedOrder);
    } catch (error) {
      console.error(error);
      showToast("Не удалось загрузить детали заказа", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openCancelModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setCancelReason(order.cancellationReason || "");
    setCancelModalOpen(true);
  };

  const handleStatusAction = async (order: AdminOrder) => {
    const normalized = normalizeStatus(order.status);
    const nextStatus =
      normalized === "new"
        ? "Собран"
        : normalized === "collected"
          ? "Завершён"
          : null;
    if (!nextStatus) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update order status");
      const updated = await res.json();
      setOrders((prev) =>
        sortOrders(
          prev.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          ),
        ),
      );
      setSelectedOrder((prev) =>
        prev?.id === updated.id ? { ...prev, ...updated } : prev,
      );
      showToast(
        `Статус заказа обновлён: ${statusLabel[normalizeStatus(updated.status)] || updated.status}`,
        "success",
      );
    } catch (error) {
      console.error(error);
      showToast("Не удалось обновить заказ", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!cancelReason.trim()) {
      showToast("Укажите причину отмены", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Отменён",
          cancellationReason: cancelReason.trim(),
        }),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to cancel order");
      }
      const updated = await res.json();
      setOrders((prev) =>
        sortOrders(
          prev.map((order) =>
            order.id === updated.id ? { ...order, ...updated } : order,
          ),
        ),
      );
      setSelectedOrder((prev) =>
        prev?.id === updated.id ? { ...prev, ...updated } : prev,
      );
      setCancelModalOpen(false);
      showToast("Заказ отменён", "success");
    } catch (error) {
      console.error(error);
      showToast("Не удалось отменить заказ", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот заказ?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setDetailsModalOpen(false);
        setSelectedOrder(null);
      }
      showToast("Заказ успешно удален", "success");
    } catch (error) {
      console.error(error);
      showToast("Не удалось удалить заказ", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Вы уверены, что хотите БЕЗВОЗВРАТНО удалить ВСЕ заказы из базы данных?"
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear orders");

      setOrders([]);
      setDetailsModalOpen(false);
      setSelectedOrder(null);
      showToast("Все заказы успешно удалены", "success");
    } catch (error) {
      console.error(error);
      showToast("Не удалось очистить заказы", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Заказы</h1>
          <p className="text-sm text-muted-foreground">
            Все заказы магазина с базовой информацией.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Обновляем..." : "Обновить"}
          </Button>
          {orders.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={actionLoading || refreshing}
            >
              Очистить все
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="text-lg font-semibold">
            Заказы не найдены
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Здесь появятся последние заказы.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const normalizedStatus = normalizeStatus(order.status);
            const isNew = normalizedStatus === "new";
            const cardClassName = cn(
              "border-border/70",
              isNew && "bg-slate-50 border-slate-300 shadow-sm",
              getStatusCardClassName(order.status),
            );

            return (
              <Card key={order.id} className={cardClassName}>
                <CardHeader className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] p-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <CardTitle className="text-lg">
                        Заказ {order.id.slice(0, 8)}
                      </CardTitle>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="inline-flex items-center gap-1.5"
                      >
                        {getStatusIcon(order.status)}
                        <span>
                          {statusLabel[normalizedStatus] || order.status}
                        </span>
                      </Badge>
                      {isNew ? <Badge variant="secondary">Новый</Badge> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium">
                        {order.total.toLocaleString("ru-RU")} ₽
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleString("ru-RU")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {isNew || normalizeStatus(order.status) === "collected" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusAction(order)}
                        disabled={actionLoading}
                      >
                        {normalizeStatus(order.status) === "new"
                          ? "Собрать"
                          : "Завершить"}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetails(order)}
                    >
                      Детали
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openCancelModal(order)}
                    >
                      Отменить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={actionLoading}
                    >
                      Удалить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 border-t border-muted/20 px-4 py-4 text-sm text-muted-foreground">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {order.customerName || order.customerEmail || "Гость"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{order.customerEmail || "Email не указан"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{order.customerPhone || "Телефон не указан"}</span>
                    </div>
                  </div>
                  {order.cancellationReason ? (
                    <div className="text-sm text-destructive">
                      Причина отмены: {order.cancellationReason}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Детали заказа</DialogTitle>
            <DialogDescription>
              Просмотр полной информации и статус заказа.
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-4 py-4 text-sm text-muted-foreground">
              <div className="grid gap-2 rounded-md border border-muted/30 bg-muted p-4">
                <div>
                  <span className="font-medium">Номер:</span> {selectedOrder.id}
                </div>
                <div>
                  <span className="font-medium">Статус:</span>{" "}
                  {statusLabel[normalizeStatus(selectedOrder.status)] ||
                    selectedOrder.status}
                </div>
                <div>
                  <span className="font-medium">Сумма:</span>{" "}
                  {selectedOrder.total.toLocaleString("ru-RU")} ₽
                </div>
                <div>
                  <span className="font-medium">Комиссия Hzcompany:</span>{" "}
                  {(() => {
                    const itemsTotal = (selectedOrder.items || []).reduce(
                      (s, it) =>
                        s + (Number(it.price) || 0) * (Number(it.qty) || 0),
                      0,
                    );
                    const computedCommission = Math.round(
                      itemsTotal *
                        (HZCOMPANY_COMMISSION_RATE /
                          (1 + HZCOMPANY_COMMISSION_RATE)),
                    );
                    const stored = (selectedOrder as any).commission;
                    const amount =
                      typeof stored === "number" && stored > 0
                        ? Math.round(stored)
                        : computedCommission;
                    return amount.toLocaleString("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                    });
                  })()}
                </div>
                <div>
                  <span className="font-medium">Клиент:</span>{" "}
                  {selectedOrder.customerName || "Гость"}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedOrder.customerEmail || "Не указан"}
                </div>
                <div>
                  <span className="font-medium">Телефон:</span>{" "}
                  {selectedOrder.customerPhone || "Не указан"}
                </div>
                {selectedOrder.cancellationReason ? (
                  <div>
                    <span className="font-medium">Причина отмены:</span>{" "}
                    {selectedOrder.cancellationReason}
                  </div>
                ) : null}
              </div>

              <div>
                <h2 className="text-sm font-semibold">Товары</h2>
                <div className="grid gap-2">
                  {selectedOrder.items?.length ? (
                    selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md border border-muted/30 bg-background p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0">
                            <div className="w-10 h-10 rounded-md border border-border/60 overflow-hidden bg-muted/40 flex items-center justify-center">
                              <PaintCan
                                color={item.color || "#E5E7EB"}
                                className="h-8 w-8"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {item.name}
                            </div>
                            <div className="text-muted-foreground text-sm truncate">
                              {item.qty} × {item.price.toLocaleString("ru-RU")}{" "}
                              ₽ — {item.volume} л
                            </div>

                            <div className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Цвет:</span>{" "}
                              {item.color ? (
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-sm border"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span>{item.color}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Не указан
                                </span>
                              )}
                              {item.ral ? (
                                <span className="ml-2">RAL: {item.ral}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Товары не найдены
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">
              Выберите заказ для просмотра.
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsModalOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отмена заказа</DialogTitle>
            <DialogDescription>
              Укажите причину отмены, чтобы сохранить её в заказе.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Отмена изменит статус заказа на «Отменён».
            </div>
            <Textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Причина отмены"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCancelOrder} disabled={actionLoading}>
              {actionLoading ? "Сохраняем..." : "Подтвердить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
