import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Listing } from '@/types'
import ListingCard from '@/components/listings/ListingCard'
import {
  MapPin,
  Phone,
  Globe,
  CheckCircle,
  MessageCircle,
  Building2,
  ArrowLeft,
  Calendar,
} from 'lucide-react'
import { getInitials, buildWhatsAppLink, formatRelativeDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
  return data as Profile | null
}

async function getSupplierListings(userId: string): Promise<Listing[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(12)
  return (data as Listing[]) ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const profile = await getProfile(id)
  if (!profile) return { title: 'Supplier Not Found' }
  return { title: profile.company_name ?? profile.full_name ?? 'Supplier Profile' }
}

export default async function SupplierProfilePage({ params }: PageProps) {
  const { id } = await params
  const [profile, listings] = await Promise.all([getProfile(id), getSupplierListings(id)])
  if (!profile) notFound()

  const whatsapp = profile.whatsapp ?? profile.phone

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/suppliers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Suppliers
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-gray-800 to-construction-steel" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
            <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg bg-brand-500 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.company_name ?? profile.full_name ?? ''}
                  width={96}
                  height={96}
                  className="rounded-2xl object-cover"
                />
              ) : (
                getInitials(profile.company_name ?? profile.full_name)
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.company_name ?? profile.full_name ?? 'Supplier'}
                </h1>
                {profile.verified && (
                  <span className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified Supplier
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {listings.length} active listing{listings.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {formatRelativeDate(profile.created_at)}
                </span>
              </div>
            </div>

            {/* Contact buttons */}
            <div className="flex gap-2 flex-wrap">
              {whatsapp && (
                <a
                  href={buildWhatsAppLink(
                    whatsapp,
                    `Hi, I found your profile on ConstructionBay.mv and would like to inquire about your products/services.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="btn-secondary text-sm">
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Active Listings ({listings.length})
        </h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>No active listings from this supplier</p>
          </div>
        )}
      </div>
    </div>
  )
}
