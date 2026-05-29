import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/ProfileForm'
import type { Profile } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/profile')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Update your contact info and supplier details</p>
      </div>
      <ProfileForm profile={profile as Profile | null} userId={user.id} />
    </div>
  )
}
