import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Event Service - Professional Event Management Platform',
  description: 'Discover amazing events with AI-powered insights, real-time summaries, and seamless event management',
  keywords: ['event management', 'react', 'nextjs', 'typescript', 'ai summaries', 'professional events'],
  authors: [{ name: 'MiniMax Agent' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Event Service - Professional Event Management',
    description: 'Comprehensive Event Management System with AI-powered summaries and real-time updates',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-gradient-to-br from-indigo-50 via-white via-purple-50 to-pink-50">
        {/* Animated background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div id="root" className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
