import { BookmarkForm } from '@/components/BookmarkForm';
import { BookmarkList } from '@/components/BookmarkList';

export default function Home() {
  return (
    <main className="container">
      <h1>Bookmark Manager</h1>
      <p className="subtitle">Next.js + tRPC + Supabase + Zod</p>
      <BookmarkForm />
      <BookmarkList />
    </main>
  );
}
