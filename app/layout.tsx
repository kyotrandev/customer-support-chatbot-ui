import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trợ lý sen - Chăm sóc khách hàng',
  description: 'Trợ lý sen - Chuyên viên chăm sóc khách hàng',
  generator: 'v0.dev',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}
