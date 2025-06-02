"use client"

import { forwardRef, useEffect, useRef, useImperativeHandle } from "react"
import YouTube from "react-youtube"

interface YouTubePlayerProps {
  videoId: string
  onTimeUpdate?: (time: number) => void
  onStateChange?: (state: number) => void
}

const YouTubePlayer = forwardRef<any, YouTubePlayerProps>(({ videoId, onTimeUpdate, onStateChange }, ref) => {
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleReady = (event: any) => {
    playerRef.current = event.target

    // Start time update interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      if (playerRef.current && onTimeUpdate) {
        const currentTime = playerRef.current.getCurrentTime()
        onTimeUpdate(currentTime)
      }
    }, 100)
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
