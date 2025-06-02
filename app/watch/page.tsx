"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ExternalLink, Music, BarChart3, User, Users } from "lucide-react"
import Link from "next/link"
import YouTubePlayer from "@/components/youtube-player"
import LineDistributionDisplay from "@/components/line-distribution-display"
import type { LineDistribution } from "@/types/line-distribution"
import SingingTimeDisplay from "@/components/singing-time-display"
import { getLineDistribution } from "@/lib/kpop-service"

export default function WatchPage() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("v") || ""
  const distId = searchParams.get("dist") || ""

  const [currentVideoId, setCurrentVideoId] = useState(videoId)
  const [videoInput, setVideoInput] = useState(videoId)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentDistribution, setCurrentDistribution] = useState<LineDistribution | null>(null)
  // const [savedDistributions, setSavedDistributions] = useLocalStorage<LineDistribution[]>("lineDistributions", [])

  const playerRef = useRef<any>(null)

  // Load distribution data
  useEffect(() => {
    const loadDistribution = async () => {
      if (distId) {
        const dist = await getLineDistribution(distId)
        if (dist) {
          setCurrentDistribution(dist)
        }
      }
    }

    loadDistribution()
  }, [distId])

  // Handle video time updates
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

  // Handle player state changes
  const handlePlayerStateChange = (state: number) => {
    setIsPlaying(state === 1) // 1 = playing
  }

  // Handle video URL input
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Extract video ID from various YouTube URL formats
    let newVideoId = videoInput

    if (videoInput.includes("youtube.com") || videoInput.includes("youtu.be")) {
      const url = new URL(videoInput)
      if (videoInput.includes("youtube.com/watch")) {
        newVideoId = url.searchParams.get("v") || ""
      } else if (videoInput.includes("youtu.be")) {
        newVideoId = url.pathname.substring(1)
      }
    }

    if (newVideoId) {
      setCurrentVideoId(newVideoId)
    }
  }

  // Find the current singer based on timestamp
  const getCurrentSinger = () => {
    if (!currentDistribution || !currentDistribution.lines) return null

    const currentLine = currentDistribution.lines.find(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime,
    )

    if (currentLine) {
      return currentDistribution.members.find((m) => m.id === currentLine.memberId) || null
    }

    return null
  }

  const currentSinger = getCurrentSinger()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">K-pop Line Distribution Viewer</h1>
      </div>

      {currentDistribution && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold">{currentDistribution.groupName}</h2>
          <p className="text-xl text-muted-foreground">{currentDistribution.songTitle}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg overflow-hidden border mb-4">
            {currentVideoId ? (
              <YouTubePlayer
                videoId={currentVideoId}
                onTimeUpdate={handleTimeUpdate}
                onStateChange={handlePlayerStateChange}
                ref={playerRef}
              />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Enter a YouTube video URL to get started</p>
              </div>
            )}
          </div>

          <form onSubmit={handleVideoSubmit} className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="YouTube URL or Video ID"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Load Video</Button>
          </form>

          {currentVideoId && !currentDistribution && (
            <div className="rounded-lg border p-4 bg-muted/50 text-center mb-6">
              <p className="mb-4">No line distribution data found for this video.</p>
              <Button asChild variant="secondary">
                <Link href={`/editor?v=${currentVideoId}`}>Create Line Distribution</Link>
              </Button>
            </div>
          )}

          {currentDistribution && (
            <div className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/editor?dist=${currentDistribution.id}`}>Edit Distribution</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.youtube.com/watch?v=${currentDistribution.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on YouTube
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <Tabs defaultValue="current">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="current" className="flex-1">
                  <User className="h-4 w-4 mr-2" />
                  Current
                </TabsTrigger>
                <TabsTrigger value="all" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Stats
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1">
                  <Music className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                {currentSinger ? (
                  <div
                    className="rounded-lg border p-4 text-center transition-colors"
                    style={{ backgroundColor: `${currentSinger.color}20` }}
                  >
                    <div
                      className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 mb-4"
                      style={{ borderColor: currentSinger.color }}
                    >
                      <img
                        src={currentSinger.imageUrl || `/placeholder.svg?height=128&width=128`}
                        alt={currentSinger.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold mb-1">{currentSinger.name}</h2>
                    <p className="text-muted-foreground">{currentSinger.position || "Member"}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border p-4 text-center bg-muted/50">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-muted mb-4 bg-muted">
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No singer
                      </div>
                    </div>
                    <p className="text-muted-foreground">No one is singing at this timestamp</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all">
                {currentDistribution ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {currentDistribution.members.map((member) => (
                        <div
                          key={member.id}
                          className={`rounded-lg border p-3 flex items-center gap-3 transition-all ${
                            currentSinger?.id === member.id ? "ring-2 ring-offset-2" : ""
                          }`}
                          style={{
                            borderColor: member.color,
                            backgroundColor: currentSinger?.id === member.id ? `${member.color}20` : undefined,
                            ringColor: member.color,
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0"
                            style={{ borderColor: member.color }}
                          >
                            <img
                              src={member.imageUrl || `/placeholder.svg?height=48&width=48`}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium line-clamp-1">{member.name}</h4>
                            <p className="text-xs text-muted-foreground">{member.position || "Member"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-4 text-center bg-muted/50">
                    <p className="text-muted-foreground">No line distribution data available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats">
                {currentDistribution ? (
                  <SingingTimeDisplay
                    distribution={currentDistribution}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                  />
                ) : (
                  <div className="rounded-lg border p-4 text-center bg-muted/50">
                    <p className="text-muted-foreground">No statistics available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline">
                {currentDistribution ? (
                  <div>
                    <LineDistributionDisplay
                      distribution={currentDistribution}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      onSeek={(time) => {
                        if (playerRef.current) {
                          playerRef.current.seekTo(time)
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border p-4 text-center bg-muted/50">
                    <p className="text-muted-foreground">No timeline available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
