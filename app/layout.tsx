import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import HeaderBar from '@/components/layout/Header';
import FooterBar from '@/components/layout/Footer';
import Providers from '@/components/dev/Providers';

export const metadata: Metadata = {
  title: 'ECE Package Tracker',
  description: 'Package management for the BYU ECE department',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  const initialRole =
    cookieStore.get('appRole')?.value === 'student' ? 'student' : 'admin';
  const initialAuth =
    cookieStore.get('testing-auth')?.value === 'true';

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers initialRole={initialRole} initialAuth={initialAuth}>
          <HeaderBar />
          <main className="flex-1">{children}</main>
          <FooterBar />
        </Providers>
      </body>
    </html>
  );
}