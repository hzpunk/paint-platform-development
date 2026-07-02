import { cn } from '@/lib/utils'

/**
 * Стилизованная банка краски, окрашиваемая в цвет товара.
 * Используется как изображение товара (генерация растровых картинок недоступна).
 * Это функциональная иллюстрация товара, а не декоративный филлер.
 */
export function PaintCan({
  color,
  label,
  className,
}: {
  /** HEX цвета краски/крышки. */
  color: string
  /** Подпись под банкой (например, название бренда) — опционально. */
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-secondary/60',
        className,
      )}
      role="img"
      aria-label={label ? `Банка краски: ${label}` : 'Банка краски'}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-3/5 w-3/5 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Корпус банки */}
        <rect x="28" y="34" width="64" height="66" rx="4" fill="#ffffff" />
        <rect
          x="28"
          y="34"
          width="64"
          height="66"
          rx="4"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        {/* Цветная этикетка */}
        <rect x="28" y="52" width="64" height="30" fill={color} opacity="0.92" />
        {/* Крышка */}
        <rect x="24" y="26" width="72" height="12" rx="3" fill={color} />
        <rect
          x="24"
          y="26"
          width="72"
          height="12"
          rx="3"
          fill="none"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="1"
        />
        {/* Ручка */}
        <path
          d="M36 26 Q60 6 84 26"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Блик */}
        <rect x="34" y="40" width="8" height="54" rx="4" fill="#ffffff" opacity="0.35" />
      </svg>
    </div>
  )
}
