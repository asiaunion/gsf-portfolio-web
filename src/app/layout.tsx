import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import { cookies } from 'next/headers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const viewport: import('next').Viewport = {
  themeColor: '#f2f4f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Disable zooming to feel native
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'GSF Portfolio V6',
  description: 'Global Asset Portfolio Dashboard',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GSF',
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has('auth_session');

  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body>
        <div className="app-container">
          {children}
        </div>
        {isAuthenticated && <BottomNav />}
      </body>
    </html>
  );
}
