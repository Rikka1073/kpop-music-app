import { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen">
      {/* ここにナビゲーションバーなどの共通要素を追加できます */}
      {children}
    </main>
  )
}
