import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Doctor Tracker',
    template: '%s | Doctor Tracker',
  },
  description: 'Find a doctor, and a secure admin dashboard to manage doctors and their patients.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before React hydrates.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
