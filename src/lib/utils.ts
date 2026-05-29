import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null, currency = 'MVR', unit?: string | null): string {
  if (price === null) return 'Contact for Price'
  const formatted = new Intl.NumberFormat('en-MV', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
  return unit ? `${currency} ${formatted} ${unit}` : `${currency} ${formatted}`
}

export function formatRelativeDate(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function buildWhatsAppLink(whatsapp: string, message: string): string {
  const cleaned = whatsapp.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${encoded}`
}

export function getWhatsAppMessage(listingTitle: string): string {
  return `Hi, I'm interested in your listing on ConstructionBay.mv: "${listingTitle}". Is it still available?`
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
