import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    category: string
    slug: string
  }>
}

// 生成静态路径
export async function generateStaticParams() {
  try {
    const notesDir = path.join(process.cwd(), 'notes')

    // 检查 notes 目录是否存在
    if (!fs.existsSync(notesDir)) {
      return []
    }

    const categories = fs.readdirSync(notesDir)
    const paths: { category: string; slug: string }[] = []

    categories.forEach(category => {
      try {
        const categoryPath = path.join(notesDir, category)
        if (!fs.statSync(categoryPath).isDirectory()) return

        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))
        files.forEach(file => {
          paths.push({
            category,
            slug: file.replace('.md', ''),
          })
        })
      } catch (error) {
        console.error(`Error reading category ${category}:`, error)
      }
    })

    return paths
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// 解析 markdown
function parseMarkdown(content: string) {
  const lines = content.split('\n')
  let metadata: Record<string, any> = {}
  let markdown = content

  // 解析 frontmatter
  if (lines[0] === '---') {
    let endIndex = -1
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        endIndex = i
        break
      }
      const [key, ...valueParts] = lines[i].split(':')
      const value = valueParts.join(':').trim()
      if (key && value) {
        metadata[key.trim()] = value
      }
    }
    if (endIndex > -1) {
      markdown = lines.slice(endIndex + 1).join('\n')
    }
  }

  // 简单的 markdown 转 HTML (仅支持基础语法)
  let html = markdown
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // 列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 段落
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<li')) {
        return para
      }
      return para.trim() ? `<p>${para.replace(/\n/g, '<br>')}</p>` : ''
    })
    .join('\n')

  // 包裹列表
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  return { metadata, html }
}

export default async function NotePage(props: Props) {
  const params = await props.params
  const { category, slug } = params

  const filePath = path.join(process.cwd(), 'notes', category, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    notFound()
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const { metadata, html } = parseMarkdown(content)

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '3rem',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* 返回按钮 */}
      <a
        href="/"
        style={{
          display: 'inline-block',
          marginBottom: '2rem',
          color: '#667eea',
          fontSize: '0.95rem',
          fontWeight: '500',
        }}
      >
        ← 返回首页
      </a>

      {/* 笔记元数据 */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{
            background: '#667eea',
            color: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}>
            {category}
          </span>
          {metadata.date && (
            <span style={{ color: '#666', fontSize: '0.9rem', alignSelf: 'center' }}>
              {metadata.date}
            </span>
          )}
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '1rem',
        }}>
          {metadata.title || slug}
        </h1>

        {metadata.tags && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {metadata.tags.split(',').map((tag: string) => (
              <span
                key={tag.trim()}
                style={{
                  background: '#f0f0f0',
                  color: '#666',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 笔记内容 */}
      <article
        style={{
          lineHeight: '1.8',
          color: '#333',
          fontSize: '1.05rem',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
