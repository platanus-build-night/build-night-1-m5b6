import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import { ArticlesProvider } from "@/context/ArticlesContext"
import GlobalUI from "@/components/GlobalUI"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Houp',
  description: 'Noticias Positivas',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
            rel="stylesheet"  
          />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950">
        <ArticlesProvider>
          {children}
          <GlobalUI />
        </ArticlesProvider>
      </body>
    </html>
  )
}
