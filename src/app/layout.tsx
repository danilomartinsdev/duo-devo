import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { getCurrentProfile } from '@/lib/profile'

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DuoDevo',
    template: '%s · DuoDevo',
  },
  description: 'Plano de leitura e oração em dupla.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // respeita a safe area do iPhone
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const perfil = await getCurrentProfile()

  return (
    <html
      lang="pt-BR"
      className={`${grotesk.variable} ${inter.variable}`}
      data-tema={perfil?.theme_color ?? 'indigo'}
      data-modo={perfil?.theme_mode ?? 'sistema'}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}