import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/Providers"
import ErrorBoundary from "@/components/ErrorBoundary"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SligoSurf - Your Ultimate Sligo Surfing Hub",
  description: "Find the perfect wave, connect with local surfers, and explore Sligo's surf spots.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <ErrorBoundary>
              <main className="min-h-screen pt-16">{children}</main>
            </ErrorBoundary>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'