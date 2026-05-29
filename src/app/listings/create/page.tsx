import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateListingForm from '@/components/listings/CreateListingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Post a Listing' }

export default async function CreateListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/listings/create')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Listing</h1>
        <p className="text-gray-500 mt-2">Reach thousands of buyers across the Maldives</p>
      </div>
      <CreateListingForm userId={user.id} />
    </div>
  )
}
