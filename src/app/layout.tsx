import type { Metadata, Viewport } from 'next';
import { Inter, Baloo_2, Share_Tech_Mono, Fira_Code } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { MatrixCanvas } from '@/components/MatrixCanvas';

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

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-code',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'CYBER-SENTINEL | Apna Bazar',
    template: '%s | SYS.ACTIVE',
  },
  description: 'Advanced Quick-Commerce Forensic Logging System',
};

export const viewport: Viewport = {
  themeColor: '#00ffcc',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${shareTechMono.variable} ${firaCode.variable}`}>
      <body className="font-mono text-[#00ffcc] antialiased min-h-[100dvh] overflow-x-hidden flex flex-col bg-[#050505]">
        <MatrixCanvas />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at center, rgba(0,245,255,0.03) 0%, transparent 70%)' }}></div>

        <div className="relative z-10 w-full h-full flex flex-col flex-1">
          {children}
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'black',
              border: '1px solid #00ffcc',
              color: '#00ffcc',
              fontFamily: 'var(--font-mono), monospace',
              borderRadius: '4px',
              boxShadow: '0 0 15px rgba(0,255,204,0.3)'
            },
          }}
        />
      </body>
    </html>
  );
}
