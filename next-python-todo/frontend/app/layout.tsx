import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Python Todo',
  description: 'Next.js + FastAPI + OpenAPI Todo App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
