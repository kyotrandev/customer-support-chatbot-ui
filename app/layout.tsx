import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sen Chatbot - Chiến thần chốt đơn",
  description: "Trợ thủ Sen - Chuyên viên tư vấn sản phẩm, chiến thần chốt đơn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased">
        <SessionProvider
          refetchOnWindowFocus={false}
          refetchInterval={0}
        >
          {children}
        </SessionProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: { 
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#333',
              fontWeight: 500
            }
          }}
        />
      </body>
    </html>
  );
}