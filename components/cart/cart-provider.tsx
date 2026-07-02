'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type { CartItem } from '@/lib/types'

// ponytail: клиентское хранилище корзины (Context + localStorage).
// Бэкенда нет — при подключении API заменить persist на серверную сессию.

const STORAGE_KEY = 'kraskaprof.cart.v1'

/** Уникальный ключ позиции: товар + расфасовка + цвет. */
function lineKey(item: Pick<CartItem, 'productId' | 'sku' | 'color'>): string {
  return `${item.productId}__${item.sku}__${item.color ?? ''}`
}

type State = { items: CartItem[] }

type Action =
  | { type: 'hydrate'; items: CartItem[] }
  | { type: 'add'; item: CartItem }
  | { type: 'remove'; key: string }
  | { type: 'setQty'; key: string; quantity: number }
  | { type: 'clear' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { items: action.items }
    case 'add': {
      const key = lineKey(action.item)
      const existing = state.items.find((i) => lineKey(i) === key)
      if (existing) {
        return {
          items: state.items.map((i) =>
            lineKey(i) === key
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        }
      }
      return { items: [...state.items, action.item] }
    }
    case 'remove':
      return { items: state.items.filter((i) => lineKey(i) !== action.key) }
    case 'setQty':
      return {
        items: state.items
          .map((i) =>
            lineKey(i) === action.key
              ? { ...i, quantity: Math.max(1, action.quantity) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      }
    case 'clear':
      return { items: [] }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  totalBonus: number
  addItem: (item: CartItem) => void
  removeItem: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clear: () => void
  keyOf: (item: Pick<CartItem, 'productId' | 'sku' | 'color'>) => string
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  // Загрузка из localStorage на клиенте после монтирования.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) dispatch({ type: 'hydrate', items: parsed })
      }
    } catch (err) {
      console.log('[v0] cart hydrate error:', (err as Error).message)
    }
  }, [])

  // Сохранение при изменении.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch (err) {
      console.log('[v0] cart persist error:', (err as Error).message)
    }
  }, [state.items])

  const addItem = useCallback((item: CartItem) => dispatch({ type: 'add', item }), [])
  const removeItem = useCallback((key: string) => dispatch({ type: 'remove', key }), [])
  const setQuantity = useCallback(
    (key: string, quantity: number) => dispatch({ type: 'setQty', key, quantity }),
    [],
  )
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((s, i) => s + i.quantity, 0)
    const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const totalBonus = state.items.reduce((s, i) => s + i.bonusPoints * i.quantity, 0)
    return {
      items: state.items,
      itemCount,
      subtotal,
      totalBonus,
      addItem,
      removeItem,
      setQuantity,
      clear,
      keyOf: lineKey,
    }
  }, [state.items, addItem, removeItem, setQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart должен использоваться внутри <CartProvider>')
  return ctx
}
