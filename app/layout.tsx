import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Immersive Experience',
  description: 'An extraordinary five-page immersive digital experience',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23ffffff'/></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
