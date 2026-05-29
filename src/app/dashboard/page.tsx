import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Listing, WantedRequest, Profile } from '@/types'
import { LISTING_TYPE_LABELS, LISTING_TYPE_COLORS } from '@/types'
import { formatRelativeDate } from '@/lib/utils'
import {
  Plus,
  Package,
  Inbox,
  Settings,
  Eye,
  Edit,
  TrendingUp,
  MessageCircle,
  CheckCircle,
} from 'lucide-react'
import type { Metadata } from 'next'
import DashboardActions from '@/components/dashboard/DashboardActions'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const [profileRes, listingsRes, wantedRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('wanted_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileRes.data as Profile | null
  const listings = (listingsRes.data as Listing[]) ?? []
  const wantedRequests = (wantedRes.data as WantedRequest[]) ?? []
  const activeListings = listings.filter((l) => l.status === 'active')
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-gray-500 mt-1">Manage your listings and profile</p>
        </div>
        <div className="flex gap-2">
          <Link href="/listings/create" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Listing
          </Link>
          <Link href="/dashboard/profile" className="btn-secondary">
            <Settings className="h-4 w-4" />
            Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Active Listings', value: activeListings.length, icon: <Package className="h-5 w-5 text-brand-500" />, bg: 'bg-brand-50' },
          { label: 'Total Views', value: totalViews, icon: <Eye className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Wanted Requests', value: wantedRequests.length, icon: <Inbox className="h-5 w-5 text-purple-500" />, bg: 'bg-purple-50' },
          { label: 'Total Listings', value: listings.length, icon: <TrendingUp className="h-5 w-5 text-green-500" />, bg: 'bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Profile notice if incomplete */}
      {(!profile?.whatsapp && !profile?.phone) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Add your WhatsApp number</p>
            <p className="text-xs text-amber-600 mt-0.5">Buyers contact you via WhatsApp. Add it to your profile to receive inquiries.</p>
          </div>
          <Link href="/dashboard/profile" className="btn-primary text-xs px-3 py-2">Update Profile</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
            <Link href="/listings/create" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              + Add New
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-4">
                  {/* Image */}
                  <div className="h-16 w-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-2xl">🏗️</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${LISTING_TYPE_COLORS[listing.listing_type as keyof typeof LISTING_TYPE_COLORS]}`}>
                        {LISTING_TYPE_LABELS[listing.listing_type as keyof typeof LISTING_TYPE_LABELS]}
                      </span>
                      <span className={`badge ${
                        listing.status === 'active' ? 'bg-green-100 text-green-800' :
                        listing.status === 'sold' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{listing.views}</span>
                      <span>{formatRelativeDate(listing.created_at)}</span>
                      {listing.price && (
                        <span className="text-brand-600 font-medium">{listing.currency} {listing.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <DashboardActions listingId={listing.id} currentStatus={listing.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-card">
              <Package className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium mb-3">No listings yet</p>
              <Link href="/listings/create" className="btn-primary inline-flex">
                <Plus className="h-4 w-4" />
                Post Your First Listing
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/listings/create" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <Plus className="h-4 w-4 text-brand-500" />
                Post a Listing
              </Link>
              <Link href="/wanted/create" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <Inbox className="h-4 w-4 text-brand-500" />
                Post Wanted Request
              </Link>
              <Link href="/dashboard/profile" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                <Settings className="h-4 w-4 text-brand-500" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Wanted Requests */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">My Wanted Requests</h3>
              <Link href="/wanted/create" className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ Add</Link>
            </div>
            {wantedRequests.length > 0 ? (
              <div className="space-y-2">
                {wantedRequests.map((req) => (
                  <div key={req.id} className="p-2.5 rounded-lg bg-gray-50 text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`badge text-xs ${req.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium text-xs truncate">{req.title}</p>
                    <p className="text-gray-400 text-xs">{formatRelativeDate(req.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No wanted requests yet</p>
            )}
          </div>

          {/* Supplier badge */}
          {profile?.is_supplier && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
              <CheckCircle className="h-8 w-8 text-brand-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-brand-800">Supplier Account</p>
              <p className="text-xs text-brand-600 mt-1">Your profile is listed in the Suppliers Directory</p>
              <Link href={`/suppliers/${user.id}`} className="text-xs text-brand-700 hover:underline mt-2 inline-block">
                View Public Profile →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
