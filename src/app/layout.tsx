import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'
import { LayoutShell } from '@/components/LayoutShell'
import { CartProvider } from '@/contexts/CartContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { AuthProvider } from '@/contexts/AuthContext'
import Link from 'next/link'
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
})
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})
export const metadata: Metadata = {
  title: 'Maria Pistache - Moda Feminina Contemporânea',
  description: 'Moda feminina sofisticada, leve e contemporânea. Descubra as coleções da Maria Pistache.',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${montserrat.variable} ${inter.variable} ${montserrat.className} bg-sand-100 text-primary-700 antialiased`}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
            <LayoutShell>
              {children}
            </LayoutShell>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
