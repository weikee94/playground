'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { SearchableNote } from '../lib/search-data'

type SearchContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  notes: SearchableNote[]
}

const SearchContext = createContext<SearchContextType | null>(null)

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}

export function SearchProvider({
  children,
  notes,
}: {
  children: ReactNode
  notes: SearchableNote[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }

      // ESC to close
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <SearchContext.Provider value={{ isOpen, setIsOpen, notes }}>
      {children}
    </SearchContext.Provider>
  )
}
