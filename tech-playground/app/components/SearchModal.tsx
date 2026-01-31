'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSearch } from './SearchProvider'
import type { SearchableNote } from '../lib/search-data'

function searchNotes(notes: SearchableNote[], query: string): SearchableNote[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return notes.filter(note =>
    note.title.toLowerCase().includes(q) ||
    note.tags.some(tag => tag.toLowerCase().includes(q)) ||
    note.content.toLowerCase().includes(q) ||
    note.category.toLowerCase().includes(q)
  ).slice(0, 8)
}

export function SearchModal() {
  const { isOpen, setIsOpen, notes } = useSearch()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const results = searchNotes(notes, query)

  // Auto-focus and reset when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          router.push(`/notes/${results[selectedIndex].slug}`)
          setIsOpen(false)
        }
        break
    }
  }

  const handleResultClick = (slug: string) => {
    router.push(`/notes/${slug}`)
    setIsOpen(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="search-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      <div
        className="search-modal"
        style={{
          width: '100%',
          maxWidth: '550px',
          maxHeight: '70vh',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e0e0e0',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.25rem', opacity: 0.5 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索笔记..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.1rem',
              background: 'transparent',
            }}
          />
          <kbd style={{
            background: '#f0f0f0',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#666',
            fontFamily: 'inherit',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
        }}>
          {query && results.length === 0 && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
            }}>
              没有找到相关笔记
            </div>
          )}

          {results.map((note, index) => (
            <div
              key={note.slug}
              className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleResultClick(note.slug)}
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: index === selectedIndex ? '#f5f0ff' : 'transparent',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}>
                <span style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}>
                  {note.category}
                </span>
                <span style={{
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '0.95rem',
                }}>
                  {note.title}
                </span>
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {note.excerpt}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        {!query && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e0e0e0',
            fontSize: '0.85rem',
            color: '#999',
            textAlign: 'center',
          }}>
            输入关键词搜索笔记标题、标签或内容
          </div>
        )}
      </div>
    </div>
  )
}
