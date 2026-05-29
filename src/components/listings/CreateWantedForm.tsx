'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { MALDIVES_LOCATIONS } from '@/types'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().max(1000).optional(),
  category: z.enum(['materials', 'equipment', 'services', '']).optional().transform(v => v || undefined),
  budget: z.string().optional(),
  currency: z.string().default('MVR'),
  location: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

type FormData = z.infer<typeof schema>

export default function CreateWantedForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'MVR', urgency: 'medium' },
  })

  const currency = watch('currency')

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase
      .from('wanted_requests')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description ?? null,
        category: data.category ?? null,
        budget: data.budget ? parseFloat(data.budget) : null,
        currency: data.currency,
        location: data.location ?? null,
        urgency: data.urgency,
        status: 'open',
      })

    if (error) {
      toast.error('Failed to post request. Try again.')
      return
    }

    toast.success('Wanted request posted!')
    router.push('/wanted')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="label">What are you looking for? *</label>
          <input
            {...register('title')}
            className="input-field"
            placeholder="e.g. Looking for 200 bags of Portland Cement"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Additional Details</label>
          <textarea
            {...register('description')}
            rows={4}
            className="input-field resize-none"
            placeholder="Specifications, delivery requirements, timeline..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select {...register('category')} className="input-field">
            <option value="">Select category</option>
            <option value="materials">🧱 Materials</option>
            <option value="equipment">🏗️ Equipment</option>
            <option value="services">🔧 Services</option>
          </select>
        </div>

        {/* Budget + Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Budget ({currency})</label>
            <input
              {...register('budget')}
              type="number"
              className="input-field"
              placeholder="Your budget"
              min={0}
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <select {...register('currency')} className="input-field">
              <option value="MVR">MVR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Location + Urgency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <select {...register('location')} className="input-field">
              <option value="">All Locations</option>
              {MALDIVES_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Urgency</label>
            <select {...register('urgency')} className="input-field">
              <option value="low">Low — Not urgent</option>
              <option value="medium">Medium — Within a month</option>
              <option value="high">High — Within a week</option>
              <option value="urgent">Urgent — ASAP</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center py-3 text-base"
      >
        {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
        Post Wanted Request
      </button>
    </form>
  )
}
