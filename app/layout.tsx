import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatAnon — Free Random Chat',
  description: 'Chat anonymously with strangers for free. No registration required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
