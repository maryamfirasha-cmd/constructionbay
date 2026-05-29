import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import WantedCard from '@/components/listings/WantedCard'
import type { WantedRequest } from '@/types'
import { Plus, Inbox } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Wanted Requests' }
export const revalidate = 60

async function getWantedRequests(category?: string): Promise<WantedRequest[]> {
  const supabase = await createClient()
  let query = supabase
    .from('wanted_requests')
    .select('*, profiles(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data } = await query.limit(50)
  return (data as WantedRequest[]) ?? []
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function WantedPage({ searchParams }: PageProps) {
  const params = await searchParams
  const category = params.category
  const requests = await getWantedRequests(category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wanted Requests</h1>
          <p className="text-gray-500 mt-1">Buyers looking for specific materials and equipment</p>
        </div>
        <Link href="/wanted/create" className="btn-primary">
          <Plus className="h-4 w-4" />
          Post Wanted Request
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { value: '', label: 'All Categories' },
          { value: 'materials', label: '🧱 Materials' },
          { value: 'equipment', label: '🏗️ Equipment' },
          { value: 'services', label: '🔧 Services' },
        ].map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/wanted?category=${cat.value}` : '/wanted'}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              (category ?? '') === cat.value
                ? 'bg-brand-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Results */}
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <WantedCard key={req.id} request={req} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Inbox className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No wanted requests yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Looking for something specific? Post a wanted request and let suppliers find you.
          </p>
          <Link href="/wanted/create" className="btn-primary inline-flex">
            <Plus className="h-4 w-4" />
            Post Wanted Request
          </Link>
        </div>
      )}
    </div>
  )
}
