"use client"

import { useKpopStore } from "@/lib/store"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Clock, Calendar } from "lucide-react"

export function SongList() {
  const { selectedGroup } = useKpopStore()

  if (!selectedGroup) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">Select a group to see available songs</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium flex items-center gap-2">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedGroup.color }} />
        {selectedGroup.name} Songs
      </h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {selectedGroup.songs.map((song) => (
          <Link key={song.id} href={`/watch?v=${song.youtubeId}&dist=${song.distributionId}`} className="block group">
            <Card className="overflow-hidden transition-all hover:ring-2 hover:ring-primary">
              <div className="aspect-video relative">
                <img
                  src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="bg-primary text-primary-foreground rounded-full p-3">
                    <Music className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{song.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{song.releaseYear}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{song.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
