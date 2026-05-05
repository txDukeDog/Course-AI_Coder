import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const mono  = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Zachary Curry | .NET Developer',
  description:
    'Senior .NET Developer in Austin, TX — 8+ years building enterprise systems with C#, .NET 8, Azure, and the full Microsoft stack.',
  keywords: ['.NET Developer', 'C#', 'Azure', 'Software Engineer', 'Austin TX', 'Full Stack'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${space.variable} ${mono.variable} font-sans bg-bg-primary text-txt-primary antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
