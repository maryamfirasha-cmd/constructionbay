export type ListingType = 'buy' | 'sell' | 'rent' | 'surplus' | 'service'
export type Category = 'materials' | 'equipment' | 'services'
export type ListingStatus = 'active' | 'sold' | 'expired' | 'draft'
export type Condition = 'new' | 'used' | 'refurbished'
export type Urgency = 'low' | 'medium' | 'high' | 'urgent'
export type WantedStatus = 'open' | 'fulfilled' | 'closed'
export type PriceUnit = 'total' | 'per_day' | 'per_week' | 'per_month' | 'negotiable'

export interface Profile {
  id: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  whatsapp: string | null
  avatar_url: string | null
  is_supplier: boolean
  bio: string | null
  location: string | null
  website: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number | null
  price_unit: PriceUnit | null
  currency: string
  category: Category
  listing_type: ListingType
  location: string | null
  images: string[] | null
  status: ListingStatus
  condition: Condition | null
  quantity: number | null
  unit: string | null
  views: number
  featured: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface WantedRequest {
  id: string
  user_id: string
  title: string
  description: string | null
  category: Category | null
  budget: number | null
  currency: string
  location: string | null
  urgency: Urgency | null
  status: WantedStatus
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface ListingFilters {
  search?: string
  category?: Category | ''
  listing_type?: ListingType | ''
  location?: string
  min_price?: number
  max_price?: number
  condition?: Condition | ''
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
}

export const MALDIVES_LOCATIONS = [
  'Malé',
  'Hulhumalé',
  'Addu City',
  'Fuvahmulah',
  'Kulhudhuffushi',
  'Naifaru',
  'Ungoofaaru',
  'Eydhafushi',
  'Thinadhoo',
  'Velidhoo',
  'Other Atoll',
] as const

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  buy:     'Wanted to Buy',
  sell:    'For Sale',
  rent:    'For Rent',
  surplus: 'Surplus Stock',
  service: 'Service',
}

export const LISTING_TYPE_COLORS: Record<ListingType, string> = {
  buy:     'bg-blue-100 text-blue-800',
  sell:    'bg-green-100 text-green-800',
  rent:    'bg-purple-100 text-purple-800',
  surplus: 'bg-yellow-100 text-yellow-800',
  service: 'bg-brand-100 text-brand-800',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  materials:  'Materials',
  equipment:  'Equipment',
  services:   'Services',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  materials: '🧱',
  equipment: '🏗️',
  services:  '🔧',
}

export const CONDITION_LABELS: Record<Condition, string> = {
  new:        'New',
  used:       'Used',
  refurbished:'Refurbished',
}

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  total:     '',
  per_day:   '/ day',
  per_week:  '/ week',
  per_month: '/ month',
  negotiable:'Negotiable',
}

export const URGENCY_COLORS: Record<Urgency, string> = {
  low:    'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high:   'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}
