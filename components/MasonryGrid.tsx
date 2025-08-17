'use client'

import { ReactNode } from 'react'
import Masonry from 'react-masonry-css'

interface MasonryGridProps {
  children: ReactNode
  className?: string
}

export default function MasonryGrid({ children, className = '' }: MasonryGridProps) {
  const breakpointColumnsObj = {
    default: 4,
    1536: 4,  // 2xl
    1280: 3,  // xl
    1024: 3,  // lg
    768: 2,   // md
    640: 2,   // sm
    480: 1    // xs
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className={`masonry-grid ${className}`}
      columnClassName="masonry-grid-column"
    >
      {children}
    </Masonry>
  )
}

// Alternative CSS Grid Masonry (fallback)
export function CSSMasonryGrid({ children, className = '' }: MasonryGridProps) {
  return (
    <div className={`columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 ${className}`}>
      {children}
    </div>
  )
}