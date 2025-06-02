"use client"

import { create } from "zustand"
import type { KpopGroup } from "./kpop-service"
import { getGroups } from "./kpop-service"

interface KpopStore {
  groups: KpopGroup[]
  selectedGroup: KpopGroup | null
  isLoading: boolean
  setSelectedGroup: (group: KpopGroup) => void
  loadGroups: () => Promise<void>
}

export const useKpopStore = create<KpopStore>((set, get) => ({
  groups: [],
  selectedGroup: null,
  isLoading: false,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  loadGroups: async () => {
    set({ isLoading: true })
    try {
      const groups = await getGroups()
      set({ groups, isLoading: false })
    } catch (error) {
      console.error("Failed to load groups:", error)
      set({ isLoading: false })
    }
  },
}))
