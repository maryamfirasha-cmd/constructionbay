import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Eye, MessageCircle } from 'lucide-react'
import type { Listing } from '@/types'
import {
  LISTING_TYPE_LABELS,
  LISTING_TYPE_COLORS,
  CATEGORY_LABELS,
} from '@/types'
import {
  formatPrice,
  formatRelativeDate,
  buildWhatsAppLink,
  getWhatsAppMessage,
} from '@/lib/utils'
import { PRICE_UNIT_LABELS } from '@/types'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const hasImage = listing.images && listing.images.length > 0
  const typeColor = LISTING_TYPE_COLORS[listing.listing_type as keyof typeof LISTING_TYPE_COLORS]
  const typeLabel = LISTING_TYPE_LABELS[listing.listing_type as keyof typeof LISTING_TYPE_LABELS]
  const categoryLabel = CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]
  const priceUnit =
    listing.price_unit && listing.price_unit !== 'total' && listing.price_unit !== 'negotiable'
      ? PRICE_UNIT_LABELS[listing.price_unit as keyof typeof PRICE_UNIT_LABELS]
      : undefined
  const whatsapp = listing.profiles?.whatsapp ?? listing.profiles?.phone

  return (
    <div className="card group hover:shadow-card-hover transition-shadow duration-200">
      {/* Image */}
      <Link href={`/listings/${listing.id}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {hasImage ? (
            <Image
              src={listing.images![0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl opacity-30">🏗️</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className={`badge ${typeColor} shadow-sm`}>{typeLabel}</span>
          </div>

          {listing.featured && (
            <div className="absolute top-2 right-2">
              <span className="badge bg-brand-500 text-white shadow-sm">Featured</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/listings/${listing.id}`} className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-2">{categoryLabel}</p>

        {/* Price */}
        <div className="mb-3">
          {listing.price_unit === 'negotiable' ? (
            <span className="text-base font-bold text-gray-700">Negotiable</span>
          ) : listing.price ? (
            <span className="text-base font-bold text-brand-600">
              {listing.currency} {listing.price.toLocaleString()}
              {priceUnit && <span className="text-xs text-gray-500 font-normal ml-0.5">{priceUnit}</span>}
            </span>
          ) : (
            <span className="text-sm text-gray-500 italic">Contact for Price</span>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {listing.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(listing.created_at)}
          </span>
          {listing.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.views}
            </span>
          )}
        </div>

        {/* Seller + WhatsApp */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
          {listing.profiles && (
            <Link
              href={`/suppliers/${listing.user_id}`}
              className="text-xs text-gray-600 hover:text-brand-600 font-medium truncate"
            >
              {listing.profiles.company_name ?? listing.profiles.full_name ?? 'Seller'}
            </Link>
          )}
          {whatsapp ? (
            <a
              href={buildWhatsAppLink(whatsapp, getWhatsAppMessage(listing.title))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-xs px-3 py-1.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          ) : (
            <Link
              href={`/listings/${listing.id}`}
              className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
