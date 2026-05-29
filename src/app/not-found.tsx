import Link from 'next/link'
import { HardHat } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-gray-200 mb-4">404</div>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-6">
          <HardHat className="h-8 w-8 text-brand-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
