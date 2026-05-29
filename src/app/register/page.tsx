'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { HardHat, Loader2 } from 'lucide-react'

const schema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
    is_supplier: z.union([
      z.literal('true').transform(() => true as const),
      z.literal('false').transform(() => false as const),
      z.boolean(),
    ]).default(false),
    company_name: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const isSupplierRaw = watch('is_supplier')
  const isSupplier = isSupplierRaw === true || (isSupplierRaw as unknown as string) === 'true'

  const onSubmit = async (data: FormData) => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (signUpError) {
      toast.error(signUpError.message)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: data.full_name,
        company_name: data.company_name ?? null,
        phone: data.phone ?? null,
        whatsapp: data.whatsapp ?? data.phone ?? null,
        is_supplier: data.is_supplier,
      })

      if (profileError) {
        toast.error('Account created but profile setup failed. Please update your profile.')
      } else {
        toast.success('Account created! Welcome to ConstructionBay.')
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="bg-brand-500 p-2 rounded-xl">
              <HardHat className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the Maldives construction marketplace</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account type */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <label className="cursor-pointer">
                <input type="radio" value="false" {...register('is_supplier')} className="sr-only" defaultChecked />
                <div className={`border-2 rounded-xl p-3 text-center text-sm transition-colors ${
                  !isSupplier ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  <div className="text-xl mb-1">🛒</div>
                  <div className="font-semibold">Buyer</div>
                  <div className="text-xs text-gray-500">Browse & buy</div>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" value="true" {...register('is_supplier')} className="sr-only" />
                <div className={`border-2 rounded-xl p-3 text-center text-sm transition-colors ${
                  isSupplier ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  <div className="text-xl mb-1">🏗️</div>
                  <div className="font-semibold">Supplier</div>
                  <div className="text-xs text-gray-500">Sell & list</div>
                </div>
              </label>
            </div>

            <div>
              <label className="label">Full Name *</label>
              <input {...register('full_name')} type="text" className="input-field" placeholder="Mohamed Ali" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            {isSupplier && (
              <div>
                <label className="label">Company Name</label>
                <input {...register('company_name')} type="text" className="input-field" placeholder="Your company name" />
              </div>
            )}

            <div>
              <label className="label">Email Address *</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} type="tel" className="input-field" placeholder="+960 300 0000" />
              </div>
              <div>
                <label className="label">WhatsApp</label>
                <input {...register('whatsapp')} type="tel" className="input-field" placeholder="+960 300 0000" />
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <input {...register('password')} type="password" className="input-field" placeholder="Min. 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <input {...register('confirm_password')} type="password" className="input-field" placeholder="Repeat password" />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              Create Account
            </button>

            <p className="text-xs text-gray-400 text-center">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-brand-600">Terms of Use</Link>
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
