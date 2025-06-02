import { Metadata } from 'next'
import { baseMetadata } from '../../metadata'

export const metadata: Metadata = {
  ...baseMetadata,
  title: 'ウォッチモード | K-pop Line Distribution Viewer',
  description: 'K-popの音楽ビデオを視聴し、リアルタイムで誰が歌っているかを確認できるウォッチモード',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'ウォッチモード | K-pop Line Distribution Viewer',
    description: 'K-popの音楽ビデオを視聴し、リアルタイムで誰が歌っているかを確認できるウォッチモード',
  },
}
