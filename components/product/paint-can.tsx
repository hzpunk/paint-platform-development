import { cn } from '@/lib/utils'

/**
 * Красивая иллюстрация банки краски в полный рост.
 * Цвет применяется к крышке и полосе на этикетке.
 */
export function PaintCan({
  color,
  label,
  className,
}: {
  color: string
  label?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 180"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('drop-shadow-2xl', className)}
      role="img"
      aria-label={label ? `Банка краски: ${label}` : 'Банка краски'}
    >
      {/* Тень под банкой */}
      <ellipse cx="50" cy="175" rx="28" ry="4" fill="rgba(0,0,0,0.25)" />

      {/* Основной корпус */}
      <rect x="14" y="42" width="72" height="118" rx="6" fill="url(#bodyGrad)" />

      {/* Боковые блики — металлический эффект */}
      <rect x="14" y="42" width="10" height="118" rx="0" fill="rgba(255,255,255,0.08)" />
      <rect x="76" y="42" width="10" height="118" rx="0" fill="rgba(0,0,0,0.08)" />

      {/* Цветная полоса (этикетка) */}
      <rect x="14" y="90" width="72" height="42" fill={color} opacity="0.95" />
      {/* Блик на полосе */}
      <rect x="14" y="90" width="72" height="6" fill="rgba(255,255,255,0.15)" />
      <rect x="14" y="126" width="72" height="6" fill="rgba(0,0,0,0.1)" />

      {/* Крышка */}
      <rect x="10" y="30" width="80" height="18" rx="5" fill={color} />
      {/* Блик на крышке */}
      <rect x="10" y="30" width="80" height="7" rx="5" fill="rgba(255,255,255,0.25)" />
      {/* Тень под крышкой */}
      <rect x="14" y="46" width="72" height="4" fill="rgba(0,0,0,0.15)" />

      {/* Ободок крышки */}
      <rect x="10" y="42" width="80" height="5" rx="2" fill={color} opacity="0.8" />

      {/* Ручка */}
      <path
        d="M32 30 Q50 8 68 30"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Крепления ручки */}
      <circle cx="32" cy="31" r="3.5" fill="#6B7280" />
      <circle cx="68" cy="31" r="3.5" fill="#6B7280" />

      {/* Нижний ободок */}
      <rect x="14" y="152" width="72" height="8" rx="4" fill="rgba(0,0,0,0.12)" />

      {/* Градиенты */}
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8eaed" />
          <stop offset="40%" stopColor="#f5f6f7" />
          <stop offset="100%" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
    </svg>
  )
}
