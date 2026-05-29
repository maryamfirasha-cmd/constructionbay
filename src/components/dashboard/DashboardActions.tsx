'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Edit, Trash2, CheckCircle } from 'lucide-react'

interface DashboardActionsProps {
  listingId: string
  currentStatus: string
}

export default function DashboardActions({ listingId, currentStatus }: DashboardActionsProps) {
  const router = useRouter()
  const supabase = createClient()

  const markAsSold = async () => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId)

    if (error) { toast.error('Failed to update'); return }
    toast.success('Marked as sold')
    router.refresh()
  }

  const deleteListing = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    const { error } = await supabase.from('listings').delete().eq('id', listingId)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Listing deleted')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <Link
        href={`/listings/${listingId}/edit`}
        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </Link>
      {currentStatus === 'active' && (
        <button
          onClick={markAsSold}
          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Mark as Sold"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={deleteListing}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
