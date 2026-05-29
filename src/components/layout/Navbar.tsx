'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Plus, ChevronDown, Search, HardHat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Browse', href: '/listings' },
  { label: 'Wanted', href: '/wanted' },
  { label: 'Suppliers', href: '/suppliers' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-brand-500 p-1.5 rounded-lg">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">
              Construction<span className="text-brand-500">Bay</span>
              <span className="text-gray-400 font-normal text-sm">.mv</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials, equipment, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={user ? '/listings/create' : '/login?redirect=/listings/create'}
              className="btn-primary hidden sm:inline-flex text-xs px-3 py-2"
            >
              <Plus className="h-4 w-4" />
              Post Listing
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/listings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Listings
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-100 my-2" />
            <Link
              href={user ? '/listings/create' : '/login?redirect=/listings/create'}
              className="btn-primary w-full justify-center text-sm"
            >
              <Plus className="h-4 w-4" />
              Post Listing
            </Link>
            {!user && (
              <Link href="/login" className="btn-secondary w-full justify-center text-sm mt-2">
                Sign In
              </Link>
            )}
            {user && (
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
