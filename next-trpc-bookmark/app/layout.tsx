import type { Metadata } from 'next';
import { TRPCProvider } from '@/components/TRPCProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookmark Manager',
  description: 'Minimal bookmark manager — Next.js + tRPC + Supabase + Zod',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
