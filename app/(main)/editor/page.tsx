"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Save, Trash2, Play, Pause, Clock, Edit } from "lucide-react"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import YouTubePlayer from "@/components/youtube-player"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { LineDistribution, Member, Line } from "@/types/line-distribution"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatTime } from "@/lib/utils"
import SingingTimeEditor from "@/components/singing-time-editor"
import { getLineDistribution } from "@/lib/kpop-service"

export default function EditorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const videoId = searchParams.get("v") || ""
  const distId = searchParams.get("dist") || ""

  const [currentVideoId, setCurrentVideoId] = useState(videoId)
  const [videoInput, setVideoInput] = useState(videoId)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [distribution, setDistribution] = useState<LineDistribution>({
    id: uuidv4(),
    youtubeId: currentVideoId,
    groupName: "",
    songTitle: "",
    members: [],
    lines: [],
  })
  const [savedDistributions, setSavedDistributions] = useLocalStorage<LineDistribution[]>("lineDistributions", [])
  const [editingLine, setEditingLine] = useState<Line | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const playerRef = useRef<any>(null)
  const lastTimeUpdateRef = useRef<number>(0)

  useEffect(() => {
    if (distId && savedDistributions.length > 0) {
      const dist = savedDistributions.find((d) => d.id === distId)
      if (dist) {
        setDistribution(dist)
        setCurrentVideoId(dist.youtubeId)
        setVideoInput(dist.youtubeId)
      }
    }
  }, [distId, savedDistributions])

  useEffect(() => {
    const loadDistributionData = async () => {
      if (distId) {
        try {
          const dist = await getLineDistribution(distId)
          if (dist) {
            setDistribution(dist)
            setCurrentVideoId(dist.youtubeId)
            setVideoInput(dist.youtubeId)
          }
        } catch (error) {
          console.error("Failed to load distribution data:", error)
        }
      }
    }

    loadDistributionData()
  }, [distId])

  // useCallbackを使用して関数を安定化
  const handleTimeUpdate = useCallback((time: number) => {
    // 更新頻度を制限（前回の更新から100ms以上経過している場合のみ更新）
    const now = Date.now()
    if (now - lastTimeUpdateRef.current > 100) {
      lastTimeUpdateRef.current = now
      setCurrentTime(time)
    }
  }, [])

  const handlePlayerStateChange = useCallback((state: number) => {
    setIsPlaying(state === 1) // 1 = playing
  }, [])

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
      setDistribution((prev) => ({
        ...prev,
        youtubeId: newVideoId,
      }))
    }
  }

  const addMember = (member: Member) => {
    setDistribution((prev) => ({
      ...prev,
      members: [...prev.members, member],
    }))
  }

  const updateMember = (updatedMember: Member) => {
    setDistribution((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
    }))
  }

  const deleteMember = (memberId: string) => {
    setDistribution((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
      lines: prev.lines.filter((l) => l.memberId !== memberId),
    }))
  }

  const addLine = (line: Line) => {
    setDistribution((prev) => ({
      ...prev,
      lines: [...prev.lines, line].sort((a, b) => a.startTime - b.startTime),
    }))
  }

  const updateLine = (updatedLine: Line) => {
    setDistribution((prev) => ({
      ...prev,
      lines: prev.lines
        .map((l) => (l.id === updatedLine.id ? updatedLine : l))
        .sort((a, b) => a.startTime - b.startTime),
    }))
  }

  const deleteLine = (lineId: string) => {
    setDistribution((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.id !== lineId),
    }))
  }

  const saveDistribution = () => {
    const updatedDistributions = savedDistributions.filter((d) => d.id !== distribution.id)
    setSavedDistributions([...updatedDistributions, distribution])
    router.push(`/watch?v=${distribution.youtubeId}&dist=${distribution.id}`)
  }

  const getCurrentSinger = () => {
    if (!distribution || !distribution.lines) return null

    const currentLine = distribution.lines.find((line) => currentTime >= line.startTime && currentTime <= line.endTime)

    if (currentLine) {
      return distribution.members.find((m) => m.id === currentLine.memberId) || null
    }

    return null
  }

  const currentSinger = getCurrentSinger()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Line Distribution Editor</h1>
        </div>
        <Button
          onClick={saveDistribution}
          disabled={!distribution.groupName || !distribution.songTitle || distribution.members.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Distribution
        </Button>
      </div>

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

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={distribution.groupName}
                onChange={(e) => setDistribution((prev) => ({ ...prev, groupName: e.target.value }))}
                placeholder="e.g. BTS, BLACKPINK"
              />
            </div>
            <div>
              <Label htmlFor="songTitle">Song Title</Label>
              <Input
                id="songTitle"
                value={distribution.songTitle}
                onChange={(e) => setDistribution((prev) => ({ ...prev, songTitle: e.target.value }))}
                placeholder="e.g. Dynamite, How You Like That"
              />
            </div>
          </div>

          <Tabs defaultValue="members">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="members" className="flex-1">
                Members ({distribution.members.length})
              </TabsTrigger>
              <TabsTrigger value="lines" className="flex-1">
                Lines ({distribution.lines.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-medium">Group Members</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <MemberForm
                      onSave={(member) => {
                        addMember(member)
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {distribution.members.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No members added yet</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <MemberForm
                        onSave={(member) => {
                          addMember(member)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {distribution.members.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-lg border p-4 flex flex-col items-center text-center"
                      style={{ borderColor: member.color }}
                    >
                      <div
                        className="w-20 h-20 rounded-full overflow-hidden border-2 mb-3"
                        style={{ borderColor: member.color }}
                      >
                        <img
                          src={member.imageUrl || `/placeholder.svg?height=80&width=80`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium">{member.name}</h4>
                      {member.position && <p className="text-sm text-muted-foreground">{member.position}</p>}
                      <div className="mt-3 flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <MemberForm
                              member={member}
                              onSave={(updatedMember) => {
                                updateMember(updatedMember)
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => deleteMember(member.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="lines">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-medium">Line Distribution</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (playerRef.current) {
                        if (isPlaying) {
                          playerRef.current.pauseVideo()
                        } else {
                          playerRef.current.playVideo()
                        }
                      }
                    }}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={distribution.members.length === 0}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Line
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <LineForm
                        members={distribution.members}
                        currentTime={currentTime}
                        onSave={(line) => {
                          addLine(line)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {distribution.members.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">Please add members first</p>
                </div>
              ) : distribution.lines.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No lines added yet</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Line
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <LineForm
                        members={distribution.members}
                        currentTime={currentTime}
                        onSave={(line) => {
                          addLine(line)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Lyrics</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distribution.lines.map((line) => {
                        const member = distribution.members.find((m) => m.id === line.memberId)
                        return (
                          <TableRow key={line.id}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (playerRef.current) {
                                    playerRef.current.seekTo(line.startTime)
                                  }
                                }}
                              >
                                {formatTime(line.startTime)}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (playerRef.current) {
                                    playerRef.current.seekTo(line.endTime)
                                  }
                                }}
                              >
                                {formatTime(line.endTime)}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: member?.color || "#ccc" }}
                                />
                                {member?.name || "Unknown"}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{line.lyrics || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <LineForm
                                      members={distribution.members}
                                      line={line}
                                      currentTime={currentTime}
                                      onSave={(updatedLine) => {
                                        updateLine(updatedLine)
                                      }}
                                    />
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" onClick={() => deleteLine(line.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <div className="sticky top-6">
            <h3 className="font-medium mb-3">Preview</h3>
            <div className="rounded-lg border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h4 className="font-medium">
                  {distribution.groupName || "Group Name"} - {distribution.songTitle || "Song Title"}
                </h4>
                <p className="text-sm text-muted-foreground">Current Time: {formatTime(currentTime)}</p>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-medium mb-2">Current Singer</h4>
                {currentSinger ? (
                  <div
                    className="rounded-lg border p-3 flex items-center gap-3"
                    style={{
                      borderColor: currentSinger.color,
                      backgroundColor: `${currentSinger.color}10`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0"
                      style={{ borderColor: currentSinger.color }}
                    >
                      <img
                        src={currentSinger.imageUrl || `/placeholder.svg?height=48&width=48`}
                        alt={currentSinger.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{currentSinger.name}</h4>
                      <p className="text-xs text-muted-foreground">{currentSinger.position || "Member"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-muted-foreground">No one is singing at this timestamp</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <h4 className="text-sm font-medium mb-2">Timeline Preview</h4>
                <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                  {distribution.lines.map((line) => {
                    const member = distribution.members.find((m) => m.id === line.memberId)
                    if (!member) return null

                    const duration = 60
                    const startPos = ((line.startTime % duration) / duration) * 100
                    const width = ((line.endTime - line.startTime) / duration) * 100

                    return (
                      <div
                        key={line.id}
                        className="absolute h-full"
                        style={{
                          left: `${startPos}%`,
                          width: `${width}%`,
                          backgroundColor: member.color,
                          opacity: 0.7,
                        }}
                        title={`${member.name}: ${formatTime(line.startTime)} - ${formatTime(line.endTime)}`}
                      />
                    )
                  })}

                  <div
                    className="absolute h-full w-0.5 bg-white z-10"
                    style={{
                      left: `${((currentTime % 60) / 60) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <SingingTimeEditor
                distribution={distribution}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onUpdateDistribution={setDistribution}
              />
            </div>

            <div className="mt-6">
              <Button
                className="w-full"
                onClick={saveDistribution}
                disabled={!distribution.groupName || !distribution.songTitle || distribution.members.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save and View Distribution
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MemberForm({
  member,
  onSave,
}: {
  member?: Member
  onSave: (member: Member) => void
}) {
  const [name, setName] = useState(member?.name || "")
  const [position, setPosition] = useState(member?.position || "")
  const [imageUrl, setImageUrl] = useState(member?.imageUrl || "")
  const [color, setColor] = useState(member?.color || "#ff0000")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: member?.id || uuidv4(),
      name,
      position,
      imageUrl,
      color,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Member name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="position">Position (optional)</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Vocalist, Rapper, Leader"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color">Member Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#ff0000"
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit">Save Member</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </>
  )
}

function LineForm({
  line,
  members,
  currentTime,
  onSave,
}: {
  line?: Line
  members: Member[]
  currentTime: number
  onSave: (line: Line) => void
}) {
  const [memberId, setMemberId] = useState(line?.memberId || (members.length > 0 ? members[0].id : ""))
  const [startTime, setStartTime] = useState(line?.startTime || Math.floor(currentTime))
  const [endTime, setEndTime] = useState(line?.endTime || Math.floor(currentTime) + 5)
  const [lyrics, setLyrics] = useState(line?.lyrics || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: line?.id || uuidv4(),
      memberId,
      startTime,
      endTime,
      lyrics,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{line ? "Edit Line" : "Add New Line"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="member">Member</Label>
            <Select value={memberId} onValueChange={setMemberId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: member.color }} />
                      {member.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex gap-2">
                <Input
                  id="startTime"
                  type="number"
                  min="0"
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(Number.parseFloat(e.target.value))}
                  required
                />
                <Button type="button" variant="outline" onClick={() => setStartTime(currentTime)}>
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">{formatTime(startTime)}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex gap-2">
                <Input
                  id="endTime"
                  type="number"
                  min="0"
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(Number.parseFloat(e.target.value))}
                  required
                />
                <Button type="button" variant="outline" onClick={() => setEndTime(currentTime)}>
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">{formatTime(endTime)}</div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lyrics">Lyrics (optional)</Label>
            <Input
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Enter lyrics for this line"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" disabled={startTime >= endTime || !memberId}>
              Save Line
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </>
  )
}
