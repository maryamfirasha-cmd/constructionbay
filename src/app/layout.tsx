import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'ConstructionBay.mv — Construction Marketplace Maldives',
    template: '%s | ConstructionBay.mv',
  },
  description:
    'Buy, sell, rent, and find construction materials, equipment, and services in the Maldives. The #1 construction marketplace in Maldives.',
  keywords: ['construction', 'materials', 'equipment', 'Maldives', 'marketplace', 'building'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://constructionbay.mv',
    siteName: 'ConstructionBay.mv',
    title: 'ConstructionBay.mv — Construction Marketplace Maldives',
    description: 'Buy, sell, rent, and find construction materials, equipment, and services in the Maldives.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
