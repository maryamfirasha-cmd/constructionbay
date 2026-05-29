import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditListingForm from '@/components/listings/EditListingForm'
import type { Listing } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Listing' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!listing) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-500 mt-2">Update your listing details</p>
      </div>
      <EditListingForm listing={listing as Listing} />
    </div>
  )
}
