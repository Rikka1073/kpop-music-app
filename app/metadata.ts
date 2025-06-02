import { Metadata, Viewport } from 'next'

export const siteConfig = {
  name: 'K-pop Line Distribution Viewer',
  description: 'K-popの音楽ビデオを視聴し、リアルタイムで誰が歌っているかを確認できるアプリ',
  url: 'https://kpop-line-distribution.example.com',
  ogImage: '/images/og-image.jpg',
  links: {
    github: 'https://github.com/example/kpop-music-app',
  },
}

// ビューポートメタデータを別のエクスポートとして設定
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const baseMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['K-pop', 'ライン配分', 'ミュージックビデオ', '歌唱時間', 'アイドル'],
  authors: [{ name: 'K-pop Music App' }],
  creator: 'K-pop Music App',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@kpopmusicapp',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}
