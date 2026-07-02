/** Форматирование цены в рублях без копеек: 1290 → «1 290 ₽». */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Число без валюты: 1290 → «1 290». */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}

/** Дата ISO → «18 июня 2026». */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

/**
 * Русская плюрализация: pluralize(2, ['товар','товара','товаров']) → 'товара'.
 */
export function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}
