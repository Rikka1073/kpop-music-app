// Member interface に歌唱時間関連のプロパティを追加
export interface Member {
  id: string
  name: string
  position?: string
  imageUrl?: string
  color: string
  totalSingingTime?: number // 総歌唱時間（秒）
  currentSingingTime?: number // 現在の歌唱時間（リアルタイム用）
}

// 歌唱時間統計用の新しいinterface
export interface SingingTimeStats {
  memberId: string
  totalTime: number
  percentage: number
  currentTime: number
}

export interface Line {
  id: string
  memberId: string
  startTime: number
  endTime: number
  lyrics?: string
}

export interface LineDistribution {
  id: string
  youtubeId: string
  groupName: string
  songTitle: string
  members: Member[]
  lines: Line[]
  totalDuration?: number // 曲の総時間
}
