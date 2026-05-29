'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { HardHat, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Welcome back!')
    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Email Address</label>
        <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="label mb-0">Password</label>
          <Link href="/reset-password" className="text-xs text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
        {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
        Sign In
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="bg-brand-500 p-2 rounded-xl">
              <HardHat className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your ConstructionBay account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
