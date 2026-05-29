import Link from 'next/link'
import { MapPin, Clock, AlertCircle, MessageCircle } from 'lucide-react'
import type { WantedRequest } from '@/types'
import { CATEGORY_LABELS, URGENCY_COLORS } from '@/types'
import { formatRelativeDate, buildWhatsAppLink } from '@/lib/utils'

interface WantedCardProps {
  request: WantedRequest
}

export default function WantedCard({ request }: WantedCardProps) {
  const urgencyColor = request.urgency
    ? URGENCY_COLORS[request.urgency as keyof typeof URGENCY_COLORS]
    : 'bg-gray-100 text-gray-700'
  const categoryLabel = request.category
    ? CATEGORY_LABELS[request.category as keyof typeof CATEGORY_LABELS]
    : null
  const whatsapp = request.profiles?.whatsapp ?? request.profiles?.phone

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge bg-blue-100 text-blue-800">Wanted</span>
            {request.urgency && (
              <span className={`badge ${urgencyColor}`}>
                {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
              </span>
            )}
            {categoryLabel && (
              <span className="badge bg-gray-100 text-gray-700">{categoryLabel}</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{request.title}</h3>
        </div>
      </div>

      {request.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{request.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        {request.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {request.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeDate(request.created_at)}
        </span>
        {request.budget && (
          <span className="flex items-center gap-1 font-medium text-gray-700">
            Budget: {request.currency} {request.budget.toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-600">
          {request.profiles?.company_name ?? request.profiles?.full_name ?? 'Buyer'}
        </div>
        {whatsapp ? (
          <a
            href={buildWhatsAppLink(
              whatsapp,
              `Hi, I can supply what you're looking for on ConstructionBay.mv: "${request.title}"`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp text-xs px-3 py-1.5"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Can Supply
          </a>
        ) : null}
      </div>
    </div>
  )
}
