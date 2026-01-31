import fs from 'fs'
import path from 'path'

export type SearchableNote = {
  slug: string
  title: string
  category: string
  tags: string[]
  content: string
  excerpt: string
  date: string
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/#{1,6}\s/g, '') // Remove headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/^[-*]\s/gm, '') // Remove list markers
    .replace(/\|[^|]+\|/g, '') // Remove table cells
    .replace(/[-:]+\|/g, '') // Remove table separators
    .replace(/\n{2,}/g, ' ') // Collapse multiple newlines
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
}

export function getSearchableNotes(): SearchableNote[] {
  try {
    const notesDir = path.join(process.cwd(), 'notes')

    if (!fs.existsSync(notesDir)) {
      return []
    }

    const categories = fs.readdirSync(notesDir)
    const notes: SearchableNote[] = []

    categories.forEach(category => {
      try {
        const categoryPath = path.join(notesDir, category)
        if (!fs.statSync(categoryPath).isDirectory()) return

        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))

        files.forEach(file => {
          try {
            const fullContent = fs.readFileSync(path.join(categoryPath, file), 'utf-8')
            const lines = fullContent.split('\n')

            // Parse frontmatter
            let title = file.replace('.md', '')
            let tags: string[] = []
            let date = new Date().toISOString().split('T')[0]
            let contentStartIndex = 0

            if (lines[0] === '---') {
              for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') {
                  contentStartIndex = i + 1
                  break
                }
                if (lines[i].startsWith('title:')) title = lines[i].replace('title:', '').trim()
                if (lines[i].startsWith('tags:')) tags = lines[i].replace('tags:', '').trim().split(',').map(t => t.trim())
                if (lines[i].startsWith('date:')) date = lines[i].replace('date:', '').trim()
              }
            }

            // Get content without frontmatter
            const content = lines.slice(contentStartIndex).join('\n')

            // Create excerpt (first 150 chars of stripped content)
            const strippedContent = stripMarkdown(content)
            const excerpt = strippedContent.slice(0, 150) + (strippedContent.length > 150 ? '...' : '')

            notes.push({
              slug: `${category}/${file.replace('.md', '')}`,
              title,
              category,
              tags,
              content: content.slice(0, 500), // Limit content for search
              excerpt,
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
