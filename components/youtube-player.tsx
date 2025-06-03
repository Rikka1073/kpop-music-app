"use client"

import { forwardRef, useEffect, useRef, useImperativeHandle, useState } from "react"
import YouTube from "react-youtube"

interface YouTubePlayerProps {
  videoId: string
  onTimeUpdate?: (time: number) => void
  onStateChange?: (state: number) => void
}

const YouTubePlayer = forwardRef<any, YouTubePlayerProps>(({ videoId, onTimeUpdate, onStateChange }, ref) => {
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTimeRef = useRef<number>(0)
  const [isReady, setIsReady] = useState(false)

  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (playerRef.current) {
        playerRef.current.playVideo()
      }
    },
    pauseVideo: () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo()
      }
    },
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, true)
      }
    },
  }))

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // 動画IDが変更されたときにインターバルをクリア
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // プレーヤーが準備できている場合は新しいインターバルを設定
    if (isReady && playerRef.current) {
      setupTimeUpdateInterval()
    }
  }, [videoId, isReady])

  const setupTimeUpdateInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // 100msごとではなく、250msごとに更新して負荷を軽減
    intervalRef.current = setInterval(() => {
      if (playerRef.current && onTimeUpdate) {
        const currentTime = playerRef.current.getCurrentTime()

        // 前回の時間と比較して変化がある場合のみ更新（小数点以下2桁で比較）
        if (Math.abs(currentTime - lastTimeRef.current) >= 0.01) {
          lastTimeRef.current = currentTime
          onTimeUpdate(currentTime)
        }
      }
    }, 250) // 更新頻度を下げる
  }

  const handleReady = (event: any) => {
    playerRef.current = event.target
    setIsReady(true)

    // プレーヤーの準備ができたらインターバルを設定
    setupTimeUpdateInterval()
  }

  const handleStateChange = (event: any) => {
    if (onStateChange) {
      onStateChange(event.data)
    }
  }

  return (
    <div className="aspect-video w-full">
      <YouTube
        videoId={videoId}
        opts={{
          height: "100%",
          width: "100%",
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
        }}
        onReady={handleReady}
        onStateChange={handleStateChange}
        className="w-full h-full"
      />
    </div>
  )
})

YouTubePlayer.displayName = "YouTubePlayer"

export default YouTubePlayer
