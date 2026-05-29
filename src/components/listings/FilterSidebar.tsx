'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import type { ListingFilters, Category, ListingType, Condition } from '@/types'
import { MALDIVES_LOCATIONS } from '@/types'

interface FilterSidebarProps {
  filters: ListingFilters
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'materials', label: '🧱 Materials' },
  { value: 'equipment', label: '🏗️ Equipment' },
  { value: 'services', label: '🔧 Services' },
]

const LISTING_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'sell', label: 'For Sale' },
  { value: 'buy', label: 'Wanted to Buy' },
  { value: 'rent', label: 'For Rent' },
  { value: 'surplus', label: 'Surplus Stock' },
  { value: 'service', label: 'Service' },
]

const CONDITIONS = [
  { value: '', label: 'Any Condition' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function FilterSidebar({ filters }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/listings?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = () => {
    router.push('/listings')
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="label">Sort by</label>
        <select
          value={filters.sort ?? 'newest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-field"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <label key={cat.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={(filters.category ?? '') === cat.value}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Listing Type */}
      <div>
        <label className="label">Listing Type</label>
        <div className="space-y-1.5">
          {LISTING_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="listing_type"
                value={type.value}
                checked={(filters.listing_type ?? '') === type.value}
                onChange={(e) => updateFilter('listing_type', e.target.value)}
                className="text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="label">Location</label>
        <select
          value={filters.location ?? ''}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="input-field"
        >
          <option value="">All Locations</option>
          {MALDIVES_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="label">Price Range (MVR)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price ?? ''}
            onChange={(e) => updateFilter('min_price', e.target.value)}
            className="input-field"
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price ?? ''}
            onChange={(e) => updateFilter('max_price', e.target.value)}
            className="input-field"
            min={0}
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="label">Condition</label>
        <div className="space-y-1.5">
          {CONDITIONS.map((cond) => (
            <label key={cond.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="condition"
                value={cond.value}
                checked={(filters.condition ?? '') === cond.value}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className="text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{cond.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
