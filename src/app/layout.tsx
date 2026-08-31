import type { Metadata, Viewport } from 'next';
import { Inter, Baloo_2 } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const baloo2 = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Apna Bazar – Han Rishta, Han Ehsaas, Humare Saath',
    template: '%s | Apna Bazar',
  },
  description:
    'Shop jewelry, cosmetics, beauty, gifts, toys, stationery and more at Apna Bazar – your trusted local shop in Bajkul, West Bengal. Fast delivery, Cash on Delivery available.',
  keywords: [
    'Apna Bazar', 'local shop', 'Bajkul', 'West Bengal', 'jewelry', 'cosmetics',
    'beauty products', 'gifts', 'stationery', 'toys', 'online shopping', 'fast delivery',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Apna Bazar',
    title: 'Apna Bazar – Han Rishta, Han Ehsaas, Humare Saath',
    description: 'Your trusted local shop – jewelry, cosmetics, beauty, gifts & more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apna Bazar',
    description: 'Your trusted local shop in Bajkul, West Bengal.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#C41E3A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${baloo2.variable}`}>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
