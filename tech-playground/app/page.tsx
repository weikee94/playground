import fs from 'fs'
import path from 'path'
import Link from 'next/link'

// 笔记数据类型
type Note = {
  slug: string
  title: string
  category: string
  tags: string[]
  date: string
}

// 读取所有笔记
function getNotes(): Note[] {
  try {
    const notesDir = path.join(process.cwd(), 'notes')

    // 检查 notes 目录是否存在
    if (!fs.existsSync(notesDir)) {
      return []
    }

    const categories = fs.readdirSync(notesDir)
    const notes: Note[] = []

    categories.forEach(category => {
      try {
        const categoryPath = path.join(notesDir, category)
        if (!fs.statSync(categoryPath).isDirectory()) return

        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))

        files.forEach(file => {
          try {
            const content = fs.readFileSync(path.join(categoryPath, file), 'utf-8')
            const lines = content.split('\n')

            // 简单的 frontmatter 解析
            let title = file.replace('.md', '')
            let tags: string[] = []
            let date = new Date().toISOString().split('T')[0]

            if (lines[0] === '---') {
              for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') break
                if (lines[i].startsWith('title:')) title = lines[i].replace('title:', '').trim()
                if (lines[i].startsWith('tags:')) tags = lines[i].replace('tags:', '').trim().split(',').map(t => t.trim())
                if (lines[i].startsWith('date:')) date = lines[i].replace('date:', '').trim()
              }
            }

            notes.push({
              slug: `${category}/${file.replace('.md', '')}`,
              title,
              category,
              tags,
              date,
            })
          } catch (error) {
            console.error(`Error reading file ${file}:`, error)
          }
        })
      } catch (error) {
        console.error(`Error reading category ${category}:`, error)
      }
    })

    return notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error reading notes:', error)
    return []
  }
}

export default function Home() {
  const notes = getNotes()

  return (
    <>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '3rem',
        marginBottom: '2rem',
        color: 'white',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          欢迎来到技术游乐场
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          探索、实验、记录 - 让技术学习变得有趣
        </p>
        <div style={{ marginTop: '2rem', fontSize: '1.1rem' }}>
          已记录 <strong>{notes.length}</strong> 条笔记
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}>
        {notes.map(note => (
          <Link
            key={note.slug}
            href={`/notes/${note.slug}`}
            className="note-card"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.85rem',
                background: '#667eea',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontWeight: '500',
              }}>
                {note.category}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {note.date}
              </span>
            </div>

            <h3 style={{
              fontSize: '1.3rem',
              marginBottom: '0.75rem',
              color: '#333',
              fontWeight: '600',
            }}>
              {note.title}
            </h3>

            {note.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.8rem',
                      background: '#f0f0f0',
                      color: '#666',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {notes.length === 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          color: '#666',
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            还没有笔记,快去 notes 目录创建你的第一条笔记吧!
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            在 notes/frontend/ 或 notes/devops/ 目录下创建 .md 文件即可
          </p>
        </div>
      )}
    </>
  )
}
