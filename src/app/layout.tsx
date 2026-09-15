import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Apna Bazar – Groceries & essentials delivered in minutes',
    template: '%s | Apna Bazar',
  },
  description: 'Your neighbourhood quick-commerce store. Fresh groceries, daily essentials & more delivered in minutes. Best prices, guaranteed freshness.',
};

export const viewport: Viewport = {
  themeColor: '#0D6B3D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-gray-900 antialiased min-h-[100dvh] overflow-x-hidden flex flex-col bg-[#F4F5F7]">
        <div className="relative z-10 w-full h-full flex flex-col flex-1">
          {children}
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              color: '#1B1B1E',
              fontFamily: 'var(--font-sans)',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: '14px 18px',
            },
          }}
        />
      </body>
    </html>
  );
}
