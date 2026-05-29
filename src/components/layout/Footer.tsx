import Link from 'next/link'
import { HardHat, Phone, Mail, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-brand-500 p-1.5 rounded-lg">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Construction<span className="text-brand-400">Bay</span>
                <span className="text-gray-500 font-normal text-sm">.mv</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              The #1 construction marketplace in the Maldives. Buy, sell, rent materials and equipment.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings?category=materials" className="hover:text-white transition-colors">Materials</Link></li>
              <li><Link href="/listings?category=equipment" className="hover:text-white transition-colors">Equipment</Link></li>
              <li><Link href="/listings?category=services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/listings?listing_type=rent" className="hover:text-white transition-colors">Rentals</Link></li>
              <li><Link href="/listings?listing_type=surplus" className="hover:text-white transition-colors">Surplus Stock</Link></li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings/create" className="hover:text-white transition-colors">Post a Listing</Link></li>
              <li><Link href="/wanted" className="hover:text-white transition-colors">Wanted Requests</Link></li>
              <li><Link href="/suppliers" className="hover:text-white transition-colors">Suppliers Directory</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span>constructionbay.mv</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@constructionbay.mv</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+960 300 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} ConstructionBay.mv. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
