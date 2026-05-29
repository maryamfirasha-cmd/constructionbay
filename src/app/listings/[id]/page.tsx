import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/types'
import {
  LISTING_TYPE_LABELS,
  LISTING_TYPE_COLORS,
  CATEGORY_LABELS,
  CONDITION_LABELS,
  PRICE_UNIT_LABELS,
} from '@/types'
import {
  formatRelativeDate,
  buildWhatsAppLink,
  getWhatsAppMessage,
  getInitials,
} from '@/lib/utils'
import { MapPin, Clock, Eye, MessageCircle, Phone, Globe, CheckCircle, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import ListingCard from '@/components/listings/ListingCard'
import ImageGallery from '@/components/listings/ImageGallery'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getListing(id: string): Promise<Listing | null> {
  const supabase = await createClient()

  // Increment view count
  await supabase.rpc('increment_listing_views', { listing_id: id })

  const { data } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  return data as Listing | null
}

async function getRelatedListings(listing: Listing): Promise<Listing[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('status', 'active')
    .eq('category', listing.category)
    .neq('id', listing.id)
    .limit(4)
  return (data as Listing[]) ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) return { title: 'Listing Not Found' }
  return {
    title: listing.title,
    description: listing.description ?? `${listing.title} available on ConstructionBay.mv`,
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const related = await getRelatedListings(listing)
  const profile = listing.profiles
  const whatsapp = profile?.whatsapp ?? profile?.phone
  const typeColor = LISTING_TYPE_COLORS[listing.listing_type as keyof typeof LISTING_TYPE_COLORS]
  const typeLabel = LISTING_TYPE_LABELS[listing.listing_type as keyof typeof LISTING_TYPE_LABELS]
  const priceUnit =
    listing.price_unit && listing.price_unit !== 'total' && listing.price_unit !== 'negotiable'
      ? PRICE_UNIT_LABELS[listing.price_unit as keyof typeof PRICE_UNIT_LABELS]
      : ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Images + Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <ImageGallery images={listing.images ?? []} title={listing.title} />

          {/* Details Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 mt-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`badge ${typeColor}`}>{typeLabel}</span>
              <span className="badge bg-gray-100 text-gray-700">
                {CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}
              </span>
              {listing.condition && (
                <span className="badge bg-gray-100 text-gray-700">
                  {CONDITION_LABELS[listing.condition as keyof typeof CONDITION_LABELS]}
                </span>
              )}
              {listing.featured && (
                <span className="badge bg-brand-100 text-brand-800">Featured</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{listing.title}</h1>

            {/* Price */}
            <div className="mb-4">
              {listing.price_unit === 'negotiable' ? (
                <span className="text-3xl font-bold text-gray-700">Negotiable</span>
              ) : listing.price ? (
                <span className="text-3xl font-bold text-brand-600">
                  {listing.currency} {listing.price.toLocaleString()}
                  {priceUnit && (
                    <span className="text-base text-gray-500 font-normal ml-1">{priceUnit}</span>
                  )}
                </span>
              ) : (
                <span className="text-xl text-gray-500 italic">Contact for Price</span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100 mb-5">
              {listing.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatRelativeDate(listing.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {listing.views} views
              </span>
              {listing.quantity && (
                <span>Qty: {listing.quantity} {listing.unit ?? ''}</span>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Seller Card */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Seller</h2>

            {/* Seller Info */}
            {profile && (
              <Link
                href={`/suppliers/${listing.user_id}`}
                className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name ?? ''}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    getInitials(profile.company_name ?? profile.full_name)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate flex items-center gap-1">
                    {profile.company_name ?? profile.full_name ?? 'Seller'}
                    {profile.verified && (
                      <CheckCircle className="h-4 w-4 text-brand-500 flex-shrink-0" />
                    )}
                  </div>
                  {profile.location && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </div>
                  )}
                  <div className="text-xs text-brand-600 mt-0.5">View Profile →</div>
                </div>
              </Link>
            )}

            {/* WhatsApp CTA */}
            {whatsapp && (
              <a
                href={buildWhatsAppLink(whatsapp, getWhatsAppMessage(listing.title))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full justify-center text-sm py-3 mb-3"
              >
                <MessageCircle className="h-5 w-5" />
                Contact via WhatsApp
              </a>
            )}

            {profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="btn-secondary w-full justify-center text-sm py-2.5 mb-3"
              >
                <Phone className="h-4 w-4" />
                {profile.phone}
              </a>
            )}

            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 justify-center"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              Always meet in a safe place. Verify items before payment.
            </p>
          </div>

          {/* Safety Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
            <strong className="block mb-1">Safety Tips</strong>
            <ul className="space-y-1 list-disc list-inside">
              <li>Inspect items before paying</li>
              <li>Use secure payment methods</li>
              <li>Meet in a public/business location</li>
              <li>Verify supplier credentials</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Listings */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="section-title mb-6">Similar Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
