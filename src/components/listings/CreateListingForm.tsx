'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import { MALDIVES_LOCATIONS } from '@/types'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().max(2000).optional(),
  category: z.enum(['materials', 'equipment', 'services']),
  listing_type: z.enum(['buy', 'sell', 'rent', 'surplus', 'service']),
  price: z.string().optional(),
  price_unit: z.enum(['total', 'per_day', 'per_week', 'per_month', 'negotiable']).default('total'),
  currency: z.string().default('MVR'),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  location: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CreateListingFormProps {
  userId: string
}

export default function CreateListingForm({ userId }: CreateListingFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'MVR', price_unit: 'total' },
  })

  const listingType = watch('listing_type')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 8 - images.length)
    const newImages = [...images, ...files].slice(0, 8)
    setImages(newImages)
    const previews = newImages.map((f) => URL.createObjectURL(f))
    setImagePreviews(previews)
  }

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx)
    setImages(next)
    setImagePreviews(next.map((f) => URL.createObjectURL(f)))
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('listing-images')
        .upload(path, file, { upsert: false })
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  const onSubmit = async (data: FormData) => {
    try {
      setUploading(true)
      const imageUrls = images.length > 0 ? await uploadImages() : []

      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          user_id: userId,
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
          images: imageUrls,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Listing posted successfully!')
      router.push(`/listings/${listing.id}`)
    } catch (err) {
      toast.error('Failed to post listing. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Type & Category */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Listing Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
          {[
            { value: 'sell', label: '🏷️ For Sale' },
            { value: 'rent', label: '🔑 For Rent' },
            { value: 'surplus', label: '📦 Surplus' },
            { value: 'service', label: '🔧 Service' },
            { value: 'buy', label: '🔍 Wanted' },
          ].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input type="radio" value={opt.value} {...register('listing_type')} className="sr-only" />
              <div className={`border-2 rounded-lg p-2.5 text-center text-sm font-medium transition-colors ${
                listingType === opt.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}>
                {opt.label}
              </div>
            </label>
          ))}
        </div>
        {errors.listing_type && <p className="text-red-500 text-xs">{errors.listing_type.message}</p>}

        <label className="label">Category *</label>
        <select {...register('category')} className="input-field">
          <option value="">Select category</option>
          <option value="materials">🧱 Materials</option>
          <option value="equipment">🏗️ Equipment</option>
          <option value="services">🔧 Services</option>
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Listing Details</h2>

        <div className="mb-4">
          <label className="label">Title *</label>
          <input
            {...register('title')}
            type="text"
            className="input-field"
            placeholder="e.g. Portland Cement 50kg Bags — 500 Available"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="mb-4">
          <label className="label">Description</label>
          <textarea
            {...register('description')}
            rows={5}
            className="input-field resize-none"
            placeholder="Describe the item, condition, specifications, delivery options..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Condition</label>
            <select {...register('condition')} className="input-field">
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Quantity</label>
            <input
              {...register('quantity')}
              type="number"
              className="input-field"
              placeholder="e.g. 500"
              min={1}
            />
          </div>
          <div>
            <label className="label">Unit</label>
            <input
              {...register('unit')}
              type="text"
              className="input-field"
              placeholder="e.g. bags, tons, pieces"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Currency</label>
            <select {...register('currency')} className="input-field">
              <option value="MVR">MVR (Maldivian Rufiyaa)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
          <div>
            <label className="label">Price</label>
            <input
              {...register('price')}
              type="number"
              className="input-field"
              placeholder="Leave blank if negotiable"
              min={0}
              step="0.01"
            />
          </div>
          <div>
            <label className="label">Price Type</label>
            <select {...register('price_unit')} className="input-field">
              <option value="total">Total Price</option>
              <option value="per_day">Per Day</option>
              <option value="per_week">Per Week</option>
              <option value="per_month">Per Month</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Photos</h2>
        <p className="text-xs text-gray-500 mb-4">Add up to 8 photos. First photo is the main image.</p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img src={src} alt="" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded">Main</span>
              )}
            </div>
          ))}

          {images.length < 8 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="btn-primary w-full justify-center py-3 text-base"
      >
        {(isSubmitting || uploading) && <Loader2 className="h-5 w-5 animate-spin" />}
        {uploading ? 'Uploading images...' : isSubmitting ? 'Posting...' : 'Post Listing'}
      </button>
    </form>
  )
}
