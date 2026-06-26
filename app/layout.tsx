'use client'

import { Inter } from 'next/font/google'
import Header from '@/components/header'
import Footer from '@/components/footer'
import QueryProvider from '@/components/query-provider'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <title>Freemium — Free Live TV Streaming</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#050816" />
      </head>
      <body className="min-h-screen bg-[#050816] font-sans antialiased">
        <QueryProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
