import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Header from '../components/general/layout/Header';
import Footer from '../components/general/layout/Footer';
import Providers from '@/components/dev/Providers';

export const metadata: Metadata = {
  title: 'ECE Mailroom',
  description: 'BYU ECE Package Tracker — log, track, and notify recipients of incoming packages.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  const initialRole = cookieStore.get('appRole')?.value === 'student' ? 'student' : 'admin';

  const initialAuth = cookieStore.get('testing-auth')?.value === 'true';

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/BYU_Block_Y_white.svg" type="image/svg+xml" />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers initialRole={initialRole} initialAuth={initialAuth}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
