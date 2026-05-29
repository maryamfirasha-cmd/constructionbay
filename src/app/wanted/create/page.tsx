import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateWantedForm from '@/components/listings/CreateWantedForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Post Wanted Request' }

export default async function CreateWantedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/wanted/create')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Wanted Request</h1>
        <p className="text-gray-500 mt-2">Tell suppliers what you need and let them come to you</p>
      </div>
      <CreateWantedForm userId={user.id} />
    </div>
  )
}
