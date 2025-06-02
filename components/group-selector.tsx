"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useKpopStore } from "@/lib/store"

export function GroupSelector() {
  const { groups, selectedGroup, isLoading, setSelectedGroup, loadGroups } = useKpopStore()

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-20 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <Button
            key={group.id}
            variant={selectedGroup?.id === group.id ? "default" : "outline"}
            onClick={() => setSelectedGroup(group)}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
            {group.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
