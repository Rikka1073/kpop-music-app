import { Metadata } from 'next'
import { baseMetadata } from '../../metadata'

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'エディターモード | K-pop Line Distribution Viewer',
  description: 'K-popの曲のライン配分を作成・編集できるエディターモード。タイムスタンプを追加して、各メンバーの歌唱時間を記録できます。',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'エディターモード | K-pop Line Distribution Viewer',
    description: 'K-popの曲のライン配分を作成・編集できるエディターモード。タイムスタンプを追加して、各メンバーの歌唱時間を記録できます。',
  },
}
