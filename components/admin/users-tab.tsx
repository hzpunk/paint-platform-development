"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/components/toast-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Shield, 
  UserX, 
  Users,
  Calendar
} from "lucide-react"

interface User {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  created_at: string
  bookings_count?: number
  total_spent?: number
}

export default function AdminUsersTab() {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updating, setUpdating] = useState<string | null>(null)

  const text = {
    ru: {
      title: "Управление пользователями",
      search: "Поиск по имени, email или телефону...",
      allRoles: "Все роли",
      admins: "Администраторы",
      users: "Пользователи",
      admin: "Администратор",
      user: "Пользователь",
      registered: "Зарегистрирован",
      bookings: "заказов",
      spent: "потрачено",
      changeRole: "Изменить роль",
      block: "Заблокировать",
      confirmBlock: "Вы уверены, что хотите заблокировать этого пользователя?",
      roleUpdated: "Роль пользователя обновлена",
      userBlocked: "Пользователь заблокирован",
      error: "Ошибка",
      noUsers: "Пользователи не найдены",
      notSpecified: "Не указан",
    },
    en: {
      title: "User Management",
      search: "Search by name, email or phone...",
      allRoles: "All roles",
      admins: "Administrators",
      users: "Users",
      admin: "Administrator",
      user: "User",
      registered: "Registered",
      bookings: "bookings",
      spent: "spent",
      changeRole: "Change role",
      block: "Block",
      confirmBlock: "Are you sure you want to block this user?",
      roleUpdated: "User role updated",
      userBlocked: "User blocked",
      error: "Error",
      noUsers: "No users found",
      notSpecified: "Not specified",
    }
  }

  const t = text[language]

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) => {
          const name = (user.full_name || "").toLowerCase()
          const email = (user.email || "").toLowerCase()
          const phone = user.phone || ""
          return name.includes(term) || email.includes(term) || phone.includes(term)
        }
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users/update-role", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        showToast(t.roleUpdated, "success")
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
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

  const handleBlockUser = async (userId: string) => {
    if (!confirm(t.confirmBlock)) return

    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users/ban", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        showToast(t.userBlocked, "success")
        setUsers((prev) => prev.filter((user) => user.id !== userId))
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
            <Users className="w-5 h-5" />
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allRoles}</SelectItem>
                <SelectItem value="admin">{t.admins}</SelectItem>
                <SelectItem value="user">{t.users}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t.noUsers}</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{user.full_name || ""}</h3>
                        <Badge className={user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                          {user.role === "admin" ? (
                            <><Shield className="w-3 h-3 mr-1" />{t.admin}</>
                          ) : (
                            <><Users className="w-3 h-3 mr-1" />{t.user}</>
                          )}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {user.phone || t.notSpecified}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {t.registered}: {new Date(user.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      {(user.bookings_count !== undefined || user.total_spent !== undefined) && (
                        <div className="flex gap-4 mt-2 text-sm">
                          {user.bookings_count !== undefined && (
                            <span className="text-green-600 font-medium">
                              {user.bookings_count} {t.bookings}
                            </span>
                          )}
                          {user.total_spent !== undefined && (
                            <span className="text-purple-600 font-medium">
                              {formatCurrency(user.total_spent)} {t.spent}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t.user}</SelectItem>
                          <SelectItem value="admin">{t.admin}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBlockUser(user.id)}
                        disabled={updating === user.id}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        {t.block}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
