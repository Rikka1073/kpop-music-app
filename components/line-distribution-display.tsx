"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { LineDistribution } from "@/types/line-distribution"
import { formatTime } from "@/lib/utils"

interface LineDistributionDisplayProps {
  distribution: LineDistribution
  currentTime: number
  isPlaying: boolean
  onSeek?: (time: number) => void
}

export default function LineDistributionDisplay({
  distribution,
  currentTime,
  isPlaying,
  onSeek,
}: LineDistributionDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleTimeRange, setVisibleTimeRange] = useState({ start: 0, end: 60 })

  // Calculate the total duration of the song based on the last line's end time
  const totalDuration = distribution.lines.length > 0 ? Math.max(...distribution.lines.map((line) => line.endTime)) : 60

  // Update visible time range based on current time
  useEffect(() => {
    const rangeWidth = visibleTimeRange.end - visibleTimeRange.start

    // If current time is outside the visible range, update the range
    if (currentTime < visibleTimeRange.start || currentTime > visibleTimeRange.end) {
      const newStart = Math.max(0, Math.floor(currentTime - rangeWidth * 0.1))
      setVisibleTimeRange({
        start: newStart,
        end: newStart + rangeWidth,
      })
    }
  }, [currentTime, visibleTimeRange])

  // Handle click on timeline to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onSeek) return

    const rect = containerRef.current.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const newTime = visibleTimeRange.start + clickPosition * (visibleTimeRange.end - visibleTimeRange.start)

    onSeek(newTime)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-2 bg-muted/30 flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(visibleTimeRange.start)}</span>
        <span>{formatTime(visibleTimeRange.end)}</span>
      </div>

      <div ref={containerRef} className="relative h-16 bg-muted/20" onClick={handleTimelineClick}>
        {/* Lines */}
        {distribution.lines.map((line) => {
          const member = distribution.members.find((m) => m.id === line.memberId)
          if (!member) return null

          // Skip if line is completely outside visible range
          if (line.endTime < visibleTimeRange.start || line.startTime > visibleTimeRange.end) {
            return null
          }

          // Calculate position and width based on visible time range
          const rangeWidth = visibleTimeRange.end - visibleTimeRange.start
          const startPos = Math.max(0, ((line.startTime - visibleTimeRange.start) / rangeWidth) * 100)
          const endPos = Math.min(100, ((line.endTime - visibleTimeRange.start) / rangeWidth) * 100)
          const width = endPos - startPos

          const isActive = currentTime >= line.startTime && currentTime <= line.endTime

          return (
            <div
              key={line.id}
              className={`absolute h-full flex items-center justify-center transition-opacity ${
                isActive ? "opacity-100" : "opacity-70"
              }`}
              style={{
                left: `${startPos}%`,
                width: `${width}%`,
                backgroundColor: member.color,
                borderLeft: startPos > 0 ? `1px solid ${member.color}` : "none",
                borderRight: endPos < 100 ? `1px solid ${member.color}` : "none",
              }}
              title={`${member.name}: ${formatTime(line.startTime)} - ${formatTime(line.endTime)}${line.lyrics ? ` - ${line.lyrics}` : ""}`}
            >
              {width > 10 && <div className="text-xs font-medium text-white truncate px-2">{member.name}</div>}
            </div>
          )
        })}

        {/* Current time indicator */}
        <div
          className="absolute h-full w-0.5 bg-white z-10 transition-all"
          style={{
            left: `${((currentTime - visibleTimeRange.start) / (visibleTimeRange.end - visibleTimeRange.start)) * 100}%`,
            display: currentTime >= visibleTimeRange.start && currentTime <= visibleTimeRange.end ? "block" : "none",
          }}
        />
      </div>

      <div className="p-2 flex justify-between items-center">
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            const rangeWidth = visibleTimeRange.end - visibleTimeRange.start
            const newStart = Math.max(0, visibleTimeRange.start - rangeWidth / 2)
            setVisibleTimeRange({
              start: newStart,
              end: newStart + rangeWidth,
            })
          }}
        >
          ← Scroll Left
        </button>

        <span className="text-xs font-medium">{formatTime(currentTime)}</span>

        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            const rangeWidth = visibleTimeRange.end - visibleTimeRange.start
            const newStart = Math.min(totalDuration - rangeWidth, visibleTimeRange.start + rangeWidth / 2)
            setVisibleTimeRange({
              start: newStart,
              end: newStart + rangeWidth,
            })
          }}
        >
          Scroll Right →
        </button>
      </div>
    </div>
  )
}
