'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { Profile } from '@/types'
import { MALDIVES_LOCATIONS } from '@/types'

const schema = z.object({
  full_name: z.string().min(2),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  website: z.string().url('Must be a valid URL (include https://)').optional().or(z.literal('')),
  is_supplier: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

export default function ProfileForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      company_name: profile?.company_name ?? '',
      phone: profile?.phone ?? '',
      whatsapp: profile?.whatsapp ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      website: profile?.website ?? '',
      is_supplier: profile?.is_supplier ?? false,
    },
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...data,
        website: data.website || null,
        company_name: data.company_name || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        bio: data.bio || null,
        location: data.location || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      toast.error('Failed to save profile')
      return
    }

    toast.success('Profile saved!')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Personal Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input {...register('full_name')} className="input-field" />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="label">Company Name</label>
            <input {...register('company_name')} className="input-field" placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input {...register('phone')} type="tel" className="input-field" placeholder="+960 300 0000" />
          </div>
          <div>
            <label className="label">WhatsApp Number</label>
            <input {...register('whatsapp')} type="tel" className="input-field" placeholder="+960 300 0000" />
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <select {...register('location')} className="input-field">
            <option value="">Select location</option>
            {MALDIVES_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Website</label>
          <input {...register('website')} type="url" className="input-field" placeholder="https://yourwebsite.com" />
          {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
        </div>

        <div>
          <label className="label">Bio / Description</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="input-field resize-none"
            placeholder="Tell buyers about your business..."
          />
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <input
            {...register('is_supplier')}
            type="checkbox"
            id="is_supplier"
            className="h-4 w-4 text-brand-500 rounded focus:ring-brand-500"
          />
          <label htmlFor="is_supplier" className="text-sm text-gray-700 cursor-pointer">
            <span className="font-medium">List me as a Supplier</span>
            <span className="block text-xs text-gray-500">Your profile will appear in the Suppliers Directory</span>
          </label>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
        {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
        Save Profile
      </button>
    </form>
  )
}
