import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import FilterSidebar from '@/components/listings/FilterSidebar'
import type { Listing, ListingFilters } from '@/types'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Browse Listings' }

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

async function getListings(filters: ListingFilters): Promise<{ data: Listing[]; count: number }> {
  const supabase = await createClient()
  let query = supabase
    .from('listings')
    .select('*, profiles(*)', { count: 'exact' })
    .eq('status', 'active')

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.listing_type) query = query.eq('listing_type', filters.listing_type)
  if (filters.location) query = query.eq('location', filters.location)
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.min_price) query = query.gte('price', filters.min_price)
  if (filters.max_price) query = query.lte('price', filters.max_price)

  switch (filters.sort) {
    case 'oldest':      query = query.order('created_at', { ascending: true }); break
    case 'price_asc':   query = query.order('price', { ascending: true, nullsFirst: false }); break
    case 'price_desc':  query = query.order('price', { ascending: false, nullsFirst: false }); break
    default:            query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
  }

  query = query.range(0, 23)
  const { data, count } = await query
  return { data: (data as Listing[]) ?? [], count: count ?? 0 }
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters: ListingFilters = {
    search:       params.search,
    category:     params.category as ListingFilters['category'],
    listing_type: params.listing_type as ListingFilters['listing_type'],
    location:     params.location,
    min_price:    params.min_price ? Number(params.min_price) : undefined,
    max_price:    params.max_price ? Number(params.max_price) : undefined,
    condition:    params.condition as ListingFilters['condition'],
    sort:         (params.sort as ListingFilters['sort']) ?? 'newest',
  }

  const { data: listings, count } = await getListings(filters)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {filters.search ? `Results for "${filters.search}"` : 'Browse Listings'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{count} listing{count !== 1 ? 's' : ''} found</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 sticky top-24">
            <Suspense>
              <FilterSidebar filters={filters} />
            </Suspense>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 text-sm">
                {filters.search
                  ? `No results for "${filters.search}". Try different keywords.`
                  : 'No listings match your filters. Try adjusting them.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
