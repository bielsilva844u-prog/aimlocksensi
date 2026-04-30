import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Header from '@/components/layout/header';
import PurchaseNotification from '@/components/purchase-notification';

export const metadata: Metadata = {
  title: 'aimlock.sensi',
  description: 'aimlock.sensi - PRECISÃO, VELOCIDADE E CONTROLE TOTAL',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'aimlock.sensi',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0404',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="relative">
        <FirebaseClientProvider>
          <Header />
          <main className="z-10">{children}</main>
          <Toaster />
          <PurchaseNotification />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
