'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@prisma/client';
import { toast } from 'sonner';

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [draft, setDraft] = useState<Partial<User> & { password?: string }>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Ошибка загрузки пользователей')
      const data = await response.json()
      setUsers(data)
    } catch (err: any) {
      setError('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }

  const openNewUser = () => {
    setEditingUser(null)
    setDraft({ name: '', email: '', role: 'user', password: '' })
    setDialogOpen(true)
  }

  const openEditUser = (user: User) => {
    setEditingUser(user)
    setDraft({ name: user.name ?? '', email: user.email, role: user.role, password: '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users', {
        method: editingUser ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          email: draft.email,
          name: draft.name,
          role: draft.role,
          password: draft.password || undefined,
        }),
      })

      if (!response.ok) throw new Error('Ошибка сохранения пользователя')
      const saved = await response.json()
      setUsers((prev) => editingUser ? prev.map((item) => item.id === editingUser.id ? { ...item, ...saved } : item) : [saved, ...prev])
      setDialogOpen(false)
      toast.success(editingUser ? 'Пользователь обновлён' : 'Пользователь создан')
    } catch (err: any) {
      toast.error(err.message || 'Не удалось сохранить пользователя')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка удаления пользователя')
      }

      await fetchUsers()
      toast.success('Пользователь удалён')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div className="text-destructive">{error}</div>

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Имя</Label>
              <Input id="user-name" value={draft.name ?? ''} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" value={draft.email ?? ''} onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="user-role">Роль</Label>
              <Input id="user-role" value={draft.role ?? 'user'} onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="user-password">Пароль {editingUser ? '(оставьте пустым, чтобы не менять)' : ''}</Label>
              <Input id="user-password" type="password" value={draft.password ?? ''} onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Пользователи</h2>
        <Button onClick={openNewUser} className="gap-2">
          <PlusCircle className="size-4" />
          Добавить пользователя
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead className="text-right">Баланс бонусов</TableHead>
              <TableHead>
                <span className="sr-only">Действия</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{user.bonusBalance}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      aria-label={`Действия для ${user.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEditUser(user)}>Редактировать</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive">
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
