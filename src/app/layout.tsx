import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ExplainMyBill — Understand any bill or contract in seconds',
    template: '%s | ExplainMyBill',
  },
  description:
    'Upload any bill, contract, or financial document and get a clear, plain-English explanation with hidden fees detection, risk analysis, and money-saving tips.',
  keywords: ['bill explainer', 'contract analyzer', 'hidden fees', 'financial document'],
  openGraph: {
    title: 'ExplainMyBill',
    description: 'Understand any bill or contract in seconds with AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
