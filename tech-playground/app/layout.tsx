import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '技术游乐场 | Tech Playground',
  description: '探索技术的游乐场 - 有趣的技术笔记与实验',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <a href="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
            }}>
              🎮 技术游乐场
            </a>
            <div style={{ display: 'flex', gap: '2rem', color: 'white' }}>
              <a href="/" style={{ opacity: 0.9, transition: 'opacity 0.2s' }}>笔记</a>
              <a href="/about" style={{ opacity: 0.9, transition: 'opacity 0.2s' }}>关于</a>
            </div>
          </div>
        </nav>
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
        }}>
          {children}
        </main>
      </body>
    </html>
  )
}
