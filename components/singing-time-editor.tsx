"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { LineDistribution, SingingTimeStats } from "@/types/line-distribution"
import { formatTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Edit, Target, BarChart3 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SingingTimeEditorProps {
  distribution: LineDistribution
  currentTime: number
  isPlaying: boolean
  onUpdateDistribution: (distribution: LineDistribution) => void
}

export default function SingingTimeEditor({
  distribution,
  currentTime,
  isPlaying,
  onUpdateDistribution,
}: SingingTimeEditorProps) {
  const [singingStats, setSingingStats] = useState<SingingTimeStats[]>([])
  const [targetDuration, setTargetDuration] = useState(
    distribution.totalDuration ||
      (distribution.lines.length > 0 ? Math.max(...distribution.lines.map((line) => line.endTime)) : 180),
  )

  // 歌唱時間統計を計算
  const calculateSingingStats = (currentPlayTime: number): SingingTimeStats[] => {
    const totalDuration = targetDuration

    return distribution.members.map((member) => {
      const memberLines = distribution.lines.filter((line) => line.memberId === member.id)
      const totalTime = memberLines.reduce((sum, line) => sum + (line.endTime - line.startTime), 0)

      let currentTime = 0
      memberLines.forEach((line) => {
        if (currentPlayTime > line.endTime) {
          currentTime += line.endTime - line.startTime
        } else if (currentPlayTime > line.startTime && currentPlayTime <= line.endTime) {
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

  useEffect(() => {
    setSingingStats(calculateSingingStats(currentTime))
  }, [distribution, currentTime, targetDuration])

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setSingingStats(calculateSingingStats(currentTime))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying, currentTime, distribution, targetDuration])

  // 目標歌唱時間を設定
  const handleSetTargetTime = (memberId: string, targetTime: number) => {
    const member = distribution.members.find((m) => m.id === memberId)
    if (!member) return

    // 現在の歌唱時間と目標時間の差を計算
    const currentStat = singingStats.find((s) => s.memberId === memberId)
    if (!currentStat) return

    const timeDifference = targetTime - currentStat.totalTime

    if (Math.abs(timeDifference) < 1) return // 1秒未満の差は無視

    // 最後のラインを調整するか、新しいラインを追加
    const memberLines = distribution.lines.filter((line) => line.memberId === memberId)

    if (memberLines.length > 0 && timeDifference > 0) {
      // 時間を増やす場合：最後のラインを延長
      const lastLine = memberLines[memberLines.length - 1]
      const updatedLines = distribution.lines.map((line) =>
        line.id === lastLine.id ? { ...line, endTime: line.endTime + timeDifference } : line,
      )

      onUpdateDistribution({
        ...distribution,
        lines: updatedLines,
        totalDuration: targetDuration,
      })
    } else if (memberLines.length > 0 && timeDifference < 0) {
      // 時間を減らす場合：最後のラインを短縮
      const lastLine = memberLines[memberLines.length - 1]
      const newEndTime = Math.max(lastLine.startTime + 1, lastLine.endTime + timeDifference)

      const updatedLines = distribution.lines.map((line) =>
        line.id === lastLine.id ? { ...line, endTime: newEndTime } : line,
      )

      onUpdateDistribution({
        ...distribution,
        lines: updatedLines,
        totalDuration: targetDuration,
      })
    }
  }

  // 均等分割機能
  const distributeEvenly = () => {
    const memberCount = distribution.members.length
    if (memberCount === 0) return

    const timePerMember = targetDuration / memberCount
    const newLines = distribution.members.map((member, index) => ({
      id: `auto-${member.id}-${Date.now()}`,
      memberId: member.id,
      startTime: index * timePerMember,
      endTime: (index + 1) * timePerMember,
      lyrics: `${member.name}のパート ${index + 1}`,
    }))

    onUpdateDistribution({
      ...distribution,
      lines: newLines,
      totalDuration: targetDuration,
    })
  }

  const getCurrentSinger = () => {
    const currentLine = distribution.lines.find((line) => currentTime >= line.startTime && currentTime <= line.endTime)
    return currentLine ? distribution.members.find((m) => m.id === currentLine.memberId) : null
  }

  const currentSinger = getCurrentSinger()
  const totalSingingTime = singingStats.reduce((sum, stat) => sum + stat.totalTime, 0)
  const coveragePercentage = targetDuration > 0 ? (totalSingingTime / targetDuration) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            歌唱時間エディタ
          </CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  目標設定
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>曲の長さ設定</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">曲の長さ（秒）</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="30"
                      max="600"
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(Number(e.target.value))}
                    />
                    <div className="text-sm text-muted-foreground">現在: {formatTime(targetDuration)}</div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      キャンセル
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      onClick={() => {
                        onUpdateDistribution({
                          ...distribution,
                          totalDuration: targetDuration,
                        })
                      }}
                    >
                      設定
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={distributeEvenly}>
              均等分割
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 全体統計 */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">総歌唱時間</div>
              <div className="font-medium">{formatTime(totalSingingTime)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">曲の長さ</div>
              <div className="font-medium">{formatTime(targetDuration)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">カバー率</div>
              <div className="font-medium">{coveragePercentage.toFixed(1)}%</div>
            </div>
          </div>
          <Progress value={coveragePercentage} className="mt-2" />
        </div>

        {/* メンバー別統計 */}
        {singingStats.map((stat) => {
          const member = distribution.members.find((m) => m.id === stat.memberId)
          if (!member) return null

          const isCurrentlySinging = currentSinger?.id === member.id
          const progressValue = stat.totalTime > 0 ? (stat.currentTime / stat.totalTime) * 100 : 0

          return (
            <div key={member.id} className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      isCurrentlySinging ? "ring-2 ring-offset-1 ring-white" : ""
                    }`}
                    style={{ backgroundColor: member.color }}
                  />
                  <span className={`font-medium ${isCurrentlySinging ? "text-primary" : ""}`}>{member.name}</span>
                  {isCurrentlySinging && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full animate-pulse">
                      歌唱中
                    </span>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{member.name}の歌唱時間調整</DialogTitle>
                    </DialogHeader>
                    <TargetTimeForm
                      member={member}
                      currentTime={stat.totalTime}
                      onSave={(targetTime) => handleSetTargetTime(member.id, targetTime)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    進捗: {formatTime(stat.currentTime)} / {formatTime(stat.totalTime)}
                  </span>
                  <span>{stat.percentage.toFixed(1)}%</span>
                </div>

                {/* 現在の進捗バー */}
                <div className="relative">
                  <Progress value={progressValue} className="h-2" />
                  {isCurrentlySinging && (
                    <div
                      className="absolute top-0 h-2 bg-white/30 rounded-full transition-all duration-100"
                      style={{
                        width: `${progressValue}%`,
                        backgroundColor: `${member.color}40`,
                      }}
                    />
                  )}
                </div>

                {/* 全体に対する割合バー */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>全体の</span>
                  <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${stat.percentage}%`,
                        backgroundColor: member.color,
                      }}
                    />
                  </div>
                  <span>{stat.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// 目標時間設定フォーム
function TargetTimeForm({
  member,
  currentTime,
  onSave,
}: {
  member: { id: string; name: string; color: string }
  currentTime: number
  onSave: (targetTime: number) => void
}) {
  const [targetMinutes, setTargetMinutes] = useState(Math.floor(currentTime / 60))
  const [targetSeconds, setTargetSeconds] = useState(Math.floor(currentTime % 60))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetTime = targetMinutes * 60 + targetSeconds
    onSave(targetTime)
  }

  const targetTime = targetMinutes * 60 + targetSeconds

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="text-sm text-muted-foreground">現在の歌唱時間: {formatTime(currentTime)}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minutes">分</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="10"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seconds">秒</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={targetSeconds}
                onChange={(e) => setTargetSeconds(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="text-sm">
            目標歌唱時間: {formatTime(targetTime)}
            <br />
            変更: {targetTime > currentTime ? "+" : ""}
            {formatTime(Math.abs(targetTime - currentTime))}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit">設定</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </>
  )
}
