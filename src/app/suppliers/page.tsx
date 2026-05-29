import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import { MapPin, CheckCircle, Building2, Search } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Suppliers Directory' }
export const revalidate = 120

async function getSuppliers(search?: string): Promise<(Profile & { listing_count: number })[]> {
  const supabase = await createClient()
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('is_supplier', true)
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data } = await query.limit(48)
  const profiles = (data as Profile[]) ?? []

  // Get listing counts
  const ids = profiles.map((p) => p.id)
  const { data: counts } = await supabase
    .from('listings')
    .select('user_id')
    .eq('status', 'active')
    .in('user_id', ids)

  const countMap: Record<string, number> = {}
  counts?.forEach((r: { user_id: string }) => {
    countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1
  })

  return profiles.map((p) => ({ ...p, listing_count: countMap[p.id] ?? 0 }))
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function SuppliersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const suppliers = await getSuppliers(params.search)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers Directory</h1>
        <p className="text-gray-500 mt-1">Find trusted construction suppliers across Maldives</p>
      </div>

      {/* Search */}
      <form className="mb-8 flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            name="search"
            type="text"
            defaultValue={params.search}
            placeholder="Search suppliers by name or company..."
            className="input-field pl-9"
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Grid */}
      {suppliers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {suppliers.map((supplier) => (
            <Link key={supplier.id} href={`/suppliers/${supplier.id}`}>
              <div className="card p-5 hover:shadow-card-hover transition-shadow group h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-14 w-14 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {supplier.avatar_url ? (
                      <Image
                        src={supplier.avatar_url}
                        alt={supplier.company_name ?? supplier.full_name ?? ''}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      getInitials(supplier.company_name ?? supplier.full_name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-brand-600 transition-colors flex items-center gap-1">
                      {supplier.company_name ?? supplier.full_name ?? 'Supplier'}
                      {supplier.verified && (
                        <CheckCircle className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      )}
                    </div>
                    {supplier.location && (
                      <div className="text-xs text-gray-500 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {supplier.location}
                      </div>
                    )}
                  </div>
                </div>

                {supplier.bio && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{supplier.bio}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {supplier.listing_count} listing{supplier.listing_count !== 1 ? 's' : ''}
                  </span>
                  {supplier.verified && (
                    <span className="text-brand-600 font-medium">Verified</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No suppliers found</p>
        </div>
      )}
    </div>
  )
}
