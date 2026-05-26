import './globals.css'

export const metadata = {
  title: 'Seller Portal | Arcade Market',
  description: 'Arcade Market Seller Portal — Arc Testnet · Circle',
  icons: {
    icon: 'https://www.arcademarkets.xyz/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
