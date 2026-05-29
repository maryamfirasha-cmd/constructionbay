'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/types'
import { MALDIVES_LOCATIONS } from '@/types'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().max(2000).optional(),
  category: z.enum(['materials', 'equipment', 'services']),
  listing_type: z.enum(['buy', 'sell', 'rent', 'surplus', 'service']),
  price: z.string().optional(),
  price_unit: z.enum(['total', 'per_day', 'per_week', 'per_month', 'negotiable']),
  currency: z.string(),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'sold', 'expired', 'draft']),
})

type FormData = z.infer<typeof schema>

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: listing.title,
      description: listing.description ?? '',
      category: listing.category as FormData['category'],
      listing_type: listing.listing_type as FormData['listing_type'],
      price: listing.price?.toString() ?? '',
      price_unit: (listing.price_unit as FormData['price_unit']) ?? 'total',
      currency: listing.currency,
      condition: (listing.condition as FormData['condition']) ?? undefined,
      quantity: listing.quantity?.toString() ?? '',
      unit: listing.unit ?? '',
      location: listing.location ?? '',
      status: listing.status as FormData['status'],
    },
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase
      .from('listings')
      .update({
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        listing_type: data.listing_type,
        price: data.price ? parseFloat(data.price) : null,
        price_unit: data.price_unit,
        currency: data.currency,
        condition: data.condition ?? null,
        quantity: data.quantity ? parseInt(data.quantity) : null,
        unit: data.unit ?? null,
        location: data.location ?? null,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id)

    if (error) {
      toast.error('Failed to update listing')
      return
    }

    toast.success('Listing updated!')
    router.push(`/listings/${listing.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 space-y-4">
        <div>
          <label className="label">Title *</label>
          <input {...register('title')} className="input-field" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea {...register('description')} rows={5} className="input-field resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select {...register('category')} className="input-field">
              <option value="materials">Materials</option>
              <option value="equipment">Equipment</option>
              <option value="services">Services</option>
            </select>
          </div>
          <div>
            <label className="label">Listing Type</label>
            <select {...register('listing_type')} className="input-field">
              <option value="sell">For Sale</option>
              <option value="buy">Wanted</option>
              <option value="rent">For Rent</option>
              <option value="surplus">Surplus</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Condition</label>
            <select {...register('condition')} className="input-field">
              <option value="">Not specified</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select {...register('location')} className="input-field">
              <option value="">Select location</option>
              {MALDIVES_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Price</label>
            <input {...register('price')} type="number" className="input-field" min={0} step="0.01" />
          </div>
          <div>
            <label className="label">Price Type</label>
            <select {...register('price_unit')} className="input-field">
              <option value="total">Total</option>
              <option value="per_day">Per Day</option>
              <option value="per_week">Per Week</option>
              <option value="per_month">Per Month</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input-field">
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1 justify-center py-3">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center py-3">
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  )
}
