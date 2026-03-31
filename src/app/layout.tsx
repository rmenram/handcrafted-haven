import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import BackToTopButton from '@/components/layout/BackToTopButton';
import AppProviders from '@/components/providers/AppProviders';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Handcrafted Haven',
  description: 'Marketplace for handcrafted products',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className='min-h-screen bg-white text-slate-900 antialiased'>
        <AppProviders>
          <div className='flex min-h-screen flex-col'>
            <Header />

            <main className='mx-auto w-full max-w-6xl flex-1 px-4 pb-8 sm:px-6 lg:px-8'>
              {children}
            </main>

            <Footer />
            <BackToTopButton />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
