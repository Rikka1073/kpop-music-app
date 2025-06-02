"use client"
import { useState, useEffect } from "react"
import type { LineDistribution, SingingTimeStats } from "@/types/line-distribution"
import { formatTime } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface SingingTimeDisplayProps {
  distribution: LineDistribution
  currentTime: number
  isPlaying: boolean
}

export default function SingingTimeDisplay({ distribution, currentTime, isPlaying }: SingingTimeDisplayProps) {
  const [singingStats, setSingingStats] = useState<SingingTimeStats[]>([])

  // 歌唱時間統計を計算
  const calculateSingingStats = (currentPlayTime: number): SingingTimeStats[] => {
    const totalDuration =
      distribution.totalDuration ||
      (distribution.lines.length > 0 ? Math.max(...distribution.lines.map((line) => line.endTime)) : 0)

    return distribution.members.map((member) => {
      // 該当メンバーの全ラインの総時間を計算
      const memberLines = distribution.lines.filter((line) => line.memberId === member.id)
      const totalTime = memberLines.reduce((sum, line) => sum + (line.endTime - line.startTime), 0)

      // 現在時刻までに歌った時間を計算
      let currentTime = 0
      memberLines.forEach((line) => {
        if (currentPlayTime > line.endTime) {
          // ライン全体が再生済み
          currentTime += line.endTime - line.startTime
        } else if (currentPlayTime > line.startTime && currentPlayTime <= line.endTime) {
          // ライン途中まで再生済み
          currentTime += currentPlayTime - line.startTime
        }
      })

      const percentage = totalDuration > 0 ? (totalTime / totalDuration) * 100 : 0

      return {
        memberId: member.id,
        totalTime,
        percentage,
        currentTime: Math.max(0, currentTime),
      }
    })
  }

  // 初期計算
  useEffect(() => {
    setSingingStats(calculateSingingStats(currentTime))
  }, [distribution, currentTime])

  // リアルタイム更新（再生中のみ）
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setSingingStats(calculateSingingStats(currentTime))
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isPlaying, currentTime, distribution])

  // 現在歌っているメンバーを取得
  const getCurrentSinger = () => {
    const currentLine = distribution.lines.find((line) => currentTime >= line.startTime && currentTime <= line.endTime)
    return currentLine ? distribution.members.find((m) => m.id === currentLine.memberId) : null
  }

  const currentSinger = getCurrentSinger()
  const totalDuration =
    distribution.totalDuration ||
    (distribution.lines.length > 0 ? Math.max(...distribution.lines.map((line) => line.endTime)) : 0)

  const totalSingingTime = singingStats.reduce((sum, stat) => sum + stat.totalTime, 0)
  const coveragePercentage = totalDuration > 0 ? (totalSingingTime / totalDuration) * 100 : 0

  return (
    <div className="space-y-4">
      {/* 全体統計をコンパクトに */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg text-center">
        <div>
          <div className="text-xs text-muted-foreground">総歌唱時間</div>
          <div className="font-medium text-sm">{formatTime(totalSingingTime)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">曲の長さ</div>
          <div className="font-medium text-sm">{formatTime(totalDuration)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">カバー率</div>
          <div className="font-medium text-sm">{coveragePercentage.toFixed(1)}%</div>
        </div>
      </div>

      {/* メンバー別統計 */}
      <div className="space-y-3">
        {singingStats.map((stat) => {
          const member = distribution.members.find((m) => m.id === stat.memberId)
          if (!member) return null

          const isCurrentlySinging = currentSinger?.id === member.id
          const progressValue = stat.totalTime > 0 ? (stat.currentTime / stat.totalTime) * 100 : 0

          return (
            <div key={member.id} className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      isCurrentlySinging ? "ring-2 ring-offset-1 ring-white" : ""
                    }`}
                    style={{ backgroundColor: member.color }}
                  />
                  <span className={`font-medium text-sm ${isCurrentlySinging ? "text-primary" : ""}`}>
                    {member.name}
                  </span>
                  {isCurrentlySinging && (
                    <span className="text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded-full animate-pulse">
                      歌唱中
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  {formatTime(stat.currentTime)} / {formatTime(stat.totalTime)}
                </div>
              </div>

              <div className="space-y-1">
                {/* プログレスバー */}
                <div className="relative">
                  <Progress value={progressValue} className="h-1.5" />
                  {isCurrentlySinging && (
                    <div
                      className="absolute top-0 h-1.5 bg-white/30 rounded-full transition-all duration-100"
                      style={{
                        width: `${progressValue}%`,
                        backgroundColor: `${member.color}40`,
                      }}
                    />
                  )}
                </div>

                {/* 全体に対する割合バー */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${stat.percentage}%`,
                        backgroundColor: member.color,
                      }}
                    />
                  </div>
                  <span className="text-xs">{stat.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
