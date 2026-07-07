"use client"

import { useEffect, useState } from "react"
import { getAllUsers, updateUserRole, deleteUser } from "@/lib/actions/users"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/toast-provider"
import { useLanguage } from "@/components/language-provider"
import { LoadingSpinner } from "./loading-spinner"
import { Trash2, Eye, Phone, Mail, Search, UserPlus, Shield, Users, Calendar, Activity, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AdminUser {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  created_at: string
}

export default function AdminUsers() {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { success, data, error: fetchError } = await getAllUsers()
      if (success && data) {
        setUsers(data)
      } else {
        setError(fetchError || t("Не удалось загрузить пользователей."))
      }
    } catch (err: any) {
      setError(err.message || t("Произошла ошибка при загрузке пользователей."))
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phone && user.phone.includes(searchTerm)),
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId)
    try {
      const { success, error: updateError } = await updateUserRole(userId, newRole)
      if (success) {
        showToast(t("Роль пользователя обновлена!"), "success")
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      } else {
        showToast(updateError || t("Ошибка при обновлении роли"), "error")
      }
    } catch (err) {
      showToast(t("Произошла ошибка при обновлении роли"), "error")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t("Вы уверены, что хотите удалить этого пользователя?"))) {
      return
    }

    setUpdatingUserId(userId)
    try {
      const { success, error: deleteError } = await deleteUser(userId)
      if (success) {
        showToast(t("Пользователь удален!"), "success")
        setUsers((prev) => prev.filter((user) => user.id !== userId))
      } else {
        showToast(deleteError || t("Ошибка при удалении пользователя"), "error")
      }
    } catch (err) {
      showToast(t("Произошла ошибка при удалении пользователя"), "error")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <Shield className="h-3 w-3 mr-1" />
            {t("Администратор")}
          </Badge>
        )
      case "user":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Users className="h-3 w-3 mr-1" />
            {t("Пользователь")}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getUserStats = () => {
    const totalUsers = users.length
    const adminUsers = users.filter((user) => user.role === "admin").length
    const regularUsers = users.filter((user) => user.role === "user").length
    const recentUsers = users.filter(
      (user) => new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length

    return { totalUsers, adminUsers, regularUsers, recentUsers }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">{t("Загружаем пользователей...")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{t(`Ошибка загрузки пользователей: ${error}`)}</p>
        <Button onClick={fetchUsers} className="mt-4">
          {t("Попробовать снова")}
        </Button>
      </div>
    )
  }

  const stats = getUserStats()

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t("Управление пользователями")}</h2>
          <p className="text-gray-600">{t("Просмотр и управление всеми пользователями системы")}</p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          {t("Обновить список")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
                <p className="text-sm text-blue-700">{t("Всего пользователей")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-900">{stats.adminUsers}</div>
                <p className="text-sm text-red-700">{t("Администраторов")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{stats.regularUsers}</div>
                <p className="text-sm text-green-700">{t("Обычных пользователей")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{stats.recentUsers}</div>
                <p className="text-sm text-purple-700">{t("Новых за неделю")}</p>
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
            placeholder={t("Поиск по имени, email или телефону...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
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

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="text-2xl font-semibold mb-4">
            {searchTerm || roleFilter !== "all"
              ? t("Пользователи не найдены.")
              : t("Нет пользователей для отображения.")}
          </CardTitle>
          <p className="text-gray-600">
            {searchTerm || roleFilter !== "all"
              ? t("Попробуйте изменить критерии поиска.")
              : t("Как только пользователи зарегистрируются, они появятся здесь.")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  {/* User Info */}
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
                      <p className="flex items-center gap-2">
                        <strong>{t("ID")}:</strong> {user.id.slice(0, 8)}...
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <strong>{t("Зарегистрирован")}:</strong> {new Date(user.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex flex-col items-center space-y-2">
                    {getRoleBadge(user.role)}
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={updatingUserId === user.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t("Пользователь")}</SelectItem>
                        <SelectItem value="admin">{t("Администратор")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingUserId === user.id && <LoadingSpinner />}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t("Подробнее")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{t("Профиль пользователя")}</DialogTitle>
                          <DialogDescription>{t("Подробная информация о пользователе")}</DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">{t("Основная информация")}</h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  <strong>{t("Имя")}:</strong> {selectedUser.full_name}
                                </p>
                                <p>
                                  <strong>{t("Email")}:</strong> {selectedUser.email}
                                </p>
                                <p>
                                  <strong>{t("Телефон")}:</strong> {selectedUser.phone || t("Не указан")}
                                </p>
                                <p className="flex items-center gap-2">
                                  <strong>{t("Роль")}:</strong> {getRoleBadge(selectedUser.role)}
                                </p>
                                <p>
                                  <strong>{t("Дата регистрации")}:</strong>{" "}
                                  {new Date(selectedUser.created_at).toLocaleDateString("ru-RU")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={updatingUserId === user.id || user.role === "admin"}
                    >
                      {updatingUserId === user.id ? (
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
