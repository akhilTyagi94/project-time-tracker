import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import LayoutWrapper from '@/components/LayoutWrapper';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getSessionUser } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OneMetric Time Tracking',
  description: 'High-converting internal time tracking and resource management',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {user ? (
            <LayoutWrapper user={user}>
              {children}
            </LayoutWrapper>
          ) : (
            <div className="auth-layout">
              {children}
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
