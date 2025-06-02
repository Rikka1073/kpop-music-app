import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Edit, Play, Search } from "lucide-react"
import { GroupSelector } from "@/components/group-selector"
import { SongList } from "@/components/song-list"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">K-pop Line Distribution Viewer</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Watch your favorite K-pop music videos and see exactly who's singing in real-time
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/watch">
                <Play className="mr-2 h-4 w-4" /> Start Watching
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/editor">
                <Edit className="mr-2 h-4 w-4" /> Create Line Distribution
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Find Line Distributions</h2>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Select a group to browse songs</span>
            </div>
          </div>

          <GroupSelector />
          <SongList />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Watch Mode</h2>
            <p className="text-muted-foreground mb-4">
              Play any K-pop music video and see which member is singing at any moment, with their photo and name
              displayed.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-primary" />
                <span>Real-time highlighting of the current singer</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-primary" />
                <span>Color-coded members for easy identification</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-primary" />
                <span>View existing line distributions from our library</span>
              </li>
            </ul>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/watch">Try Watch Mode</Link>
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Editor Mode</h2>
            <p className="text-muted-foreground mb-4">
              Create and edit your own line distributions for any K-pop song with our easy-to-use editor.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-primary" />
                <span>Mark timestamps for each member's lines</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-primary" />
                <span>Add member profiles with photos and custom colors</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 text-primary" />
                <span>Save and share your line distributions</span>
              </li>
            </ul>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/editor">Try Editor Mode</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
