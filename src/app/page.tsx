import Link from 'next/link'
import { Search, ArrowRight, Package, Wrench, Truck, Star, Plus, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import WantedCard from '@/components/listings/WantedCard'
import type { Listing, WantedRequest } from '@/types'

export const revalidate = 60

async function getFeaturedListings(): Promise<Listing[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(8)
  return (data as Listing[]) ?? []
}

async function getRecentWanted(): Promise<WantedRequest[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wanted_requests')
    .select('*, profiles(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(4)
  return (data as WantedRequest[]) ?? []
}

async function getStats() {
  const supabase = await createClient()
  const [listingsRes, suppliersRes] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_supplier', true),
  ])
  return {
    listings: listingsRes.count ?? 0,
    suppliers: suppliersRes.count ?? 0,
  }
}

export default async function HomePage() {
  const [listings, wantedRequests, stats] = await Promise.all([
    getFeaturedListings(),
    getRecentWanted(),
    getStats(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-construction-steel to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-brand-500/30">
              <ShieldCheck className="h-4 w-4" />
              Maldives #1 Construction Marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Find Construction
              <span className="text-brand-400 block">Materials & Services</span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl mb-10 leading-relaxed">
              Buy, sell, rent equipment and materials. Connect with trusted suppliers across the Maldives.
            </p>

            {/* Search */}
            <form action="/listings" method="get" className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="search"
                  type="text"
                  placeholder="Search materials, equipment, services..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3.5 rounded-xl text-sm">
                Search
              </button>
            </form>

            {/* Quick categories */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                { label: '🧱 Materials', href: '/listings?category=materials' },
                { label: '🏗️ Equipment', href: '/listings?category=equipment' },
                { label: '🔧 Services', href: '/listings?category=services' },
                { label: '📦 Surplus', href: '/listings?listing_type=surplus' },
                { label: '🚜 Rentals', href: '/listings?listing_type=rent' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-black/20 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{stats.listings}+</div>
                <div className="text-xs text-gray-400">Active Listings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.suppliers}+</div>
                <div className="text-xs text-gray-400">Verified Suppliers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">26</div>
                <div className="text-xs text-gray-400">Atolls Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Latest Listings</h2>
            <p className="text-sm text-gray-500 mt-1">Fresh construction materials and equipment</p>
          </div>
          <Link href="/listings" className="btn-secondary text-sm gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No listings yet</p>
            <p className="text-sm mt-1">Be the first to post a listing!</p>
            <Link href="/listings/create" className="btn-primary mt-4 inline-flex">
              <Plus className="h-4 w-4" />
              Post Listing
            </Link>
          </div>
        )}
      </section>

      {/* Type Filter Shortcuts */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="section-title mb-6 text-center">Browse by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { type: 'sell', label: 'For Sale', icon: '🏷️', desc: 'New & used items', color: 'border-green-200 bg-green-50 hover:bg-green-100' },
              { type: 'rent', label: 'For Rent', icon: '🔑', desc: 'Short & long term', color: 'border-purple-200 bg-purple-50 hover:bg-purple-100' },
              { type: 'surplus', label: 'Surplus', icon: '📦', desc: 'Excess stock deals', color: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' },
              { type: 'service', label: 'Services', icon: '🔧', desc: 'Skilled contractors', color: 'border-brand-200 bg-brand-50 hover:bg-brand-100' },
              { type: 'buy', label: 'Wanted', icon: '🔍', desc: 'Looking to buy', color: 'border-blue-200 bg-blue-50 hover:bg-blue-100' },
            ].map((item) => (
              <Link
                key={item.type}
                href={`/listings?listing_type=${item.type}`}
                className={`border rounded-xl p-4 text-center transition-colors ${item.color}`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Wanted Requests */}
      {wantedRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Wanted Requests</h2>
              <p className="text-sm text-gray-500 mt-1">Buyers looking for specific materials</p>
            </div>
            <Link href="/wanted" className="btn-secondary text-sm gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wantedRequests.map((req) => (
              <WantedCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="section-title text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <Plus className="h-6 w-6" />,
                title: 'Post Your Listing',
                desc: 'List materials, equipment, or services in minutes. Add photos and set your price.',
                color: 'bg-brand-100 text-brand-600',
              },
              {
                step: '2',
                icon: <Search className="h-6 w-6" />,
                title: 'Buyers Find You',
                desc: 'Contractors and builders across Maldives search and discover your listing.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                step: '3',
                icon: <Truck className="h-6 w-6" />,
                title: 'Connect & Deal',
                desc: 'Chat via WhatsApp instantly. Close the deal on your terms.',
                color: 'bg-green-100 text-green-600',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${item.color} mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Star className="h-10 w-10 mx-auto mb-4 text-brand-200" />
          <h2 className="text-3xl font-bold mb-4">Are You a Supplier?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Reach thousands of contractors, builders, and developers across Maldives. Create your supplier profile today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
            >
              Create Supplier Account
            </Link>
            <Link
              href="/suppliers"
              className="inline-flex items-center justify-center gap-2 border border-brand-300 text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-400 transition-colors"
            >
              Browse Suppliers
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
