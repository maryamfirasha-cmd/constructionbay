'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-8xl opacity-20">🏗️</span>
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  return (
    <div className="rounded-xl overflow-hidden">
      {/* Main image */}
      <div className="relative h-80 sm:h-96 bg-gray-100 group">
        <Image
          src={images[current]}
          alt={`${title} - photo ${current + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs rounded-full px-2.5 py-1">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? 'border-brand-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
