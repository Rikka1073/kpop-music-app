"use client"

import { useState } from 'react'
import SingingTimeEditor from "@/components/singing-time-editor"
import type { LineDistribution } from "@/types/line-distribution"

// 初期データのサンプル
const initialDistribution: LineDistribution = {
  id: 'new-distribution',
  youtubeId: '',
  groupName: '',
  songTitle: '',
  totalDuration: 180,
  members: [
    { id: '1', name: 'メンバー1', color: '#FF5733' },
    { id: '2', name: 'メンバー2', color: '#33FF57' },
    { id: '3', name: 'メンバー3', color: '#3357FF' },
  ],
  lines: []
}

export default function EditorPage() {
  const [distribution, setDistribution] = useState<LineDistribution>(initialDistribution)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleUpdateDistribution = (updatedDistribution: LineDistribution) => {
    setDistribution(updatedDistribution)
    // ここで必要に応じてデータの保存処理などを行うことができます
    console.log('配分が更新されました:', updatedDistribution)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">ライン配分エディター</h1>
        <p className="text-muted-foreground mb-8">
          K-popの曲のライン配分を作成・編集できます。タイムスタンプを追加して、各メンバーの歌唱時間を記録しましょう。
        </p>
        <SingingTimeEditor 
          distribution={distribution}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onUpdateDistribution={handleUpdateDistribution}
        />
      </div>
    </div>
  )
}
