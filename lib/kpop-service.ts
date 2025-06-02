import { supabase } from "./supabase"
import type { LineDistribution } from "@/types/line-distribution"

export interface KpopGroup {
  id: string
  name: string
  color: string
  songs: KpopSong[]
}

export interface KpopSong {
  id: string
  title: string
  releaseYear: string
  duration: string
  youtubeId: string
  distributionId: string
}

// グループ一覧を取得
export async function getGroups(): Promise<KpopGroup[]> {
  const { data: groups, error: groupsError } = await supabase.from("groups").select("*").order("name")

  if (groupsError) {
    console.error("Error fetching groups:", groupsError)
    return []
  }

  const { data: songs, error: songsError } = await supabase.from("songs").select("*").order("title")

  if (songsError) {
    console.error("Error fetching songs:", songsError)
    return []
  }

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    color: group.color,
    songs: songs
      .filter((song) => song.group_id === group.id)
      .map((song) => ({
        id: song.id,
        title: song.title,
        releaseYear: song.release_year || "",
        duration: song.duration || "",
        youtubeId: song.youtube_id,
        distributionId: song.id, // songのIDをdistributionIdとして使用
      })),
  }))
}

// 特定の曲の歌割りデータを取得
export async function getLineDistribution(songId: string): Promise<LineDistribution | null> {
  // 曲情報を取得
  const { data: song, error: songError } = await supabase
    .from("songs")
    .select(`
      *,
      groups (*)
    `)
    .eq("id", songId)
    .single()

  if (songError || !song) {
    console.error("Error fetching song:", songError)
    return null
  }

  // メンバー情報を取得
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("*")
    .eq("group_id", song.group_id)
    .order("name")

  if (membersError) {
    console.error("Error fetching members:", membersError)
    return null
  }

  // ライン情報を取得
  const { data: lines, error: linesError } = await supabase
    .from("lines")
    .select("*")
    .eq("song_id", songId)
    .order("start_time")

  if (linesError) {
    console.error("Error fetching lines:", linesError)
    return null
  }

  return {
    id: song.id,
    youtubeId: song.youtube_id,
    groupName: song.groups.name,
    songTitle: song.title,
    totalDuration: song.total_duration || undefined,
    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      position: member.position || undefined,
      imageUrl: member.image_url || undefined,
      color: member.color,
    })),
    lines: lines.map((line) => ({
      id: line.id,
      memberId: line.member_id,
      startTime: Number(line.start_time),
      endTime: Number(line.end_time),
      lyrics: line.lyrics || undefined,
    })),
  }
}

// 歌割りデータを保存
export async function saveLineDistribution(distribution: LineDistribution): Promise<boolean> {
  try {
    // トランザクション的に処理するため、エラーハンドリングを含める

    // 1. グループが存在するかチェック、なければ作成
    const { data: existingGroup } = await supabase
      .from("groups")
      .select("id")
      .eq("name", distribution.groupName)
      .single()

    let groupId = existingGroup?.id

    if (!groupId) {
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: distribution.groupName,
          color: "#8d2de2", // デフォルトカラー
        })
        .select("id")
        .single()

      if (groupError) throw groupError
      groupId = newGroup.id
    }

    // 2. メンバーを保存/更新
    for (const member of distribution.members) {
      const { error: memberError } = await supabase.from("members").upsert({
        id: member.id,
        group_id: groupId,
        name: member.name,
        position: member.position,
        image_url: member.imageUrl,
        color: member.color,
      })

      if (memberError) throw memberError
    }

    // 3. 曲を保存/更新
    const { error: songError } = await supabase.from("songs").upsert({
      id: distribution.id,
      group_id: groupId,
      title: distribution.songTitle,
      youtube_id: distribution.youtubeId,
      total_duration: distribution.totalDuration,
    })

    if (songError) throw songError

    // 4. 既存のラインを削除
    const { error: deleteError } = await supabase.from("lines").delete().eq("song_id", distribution.id)

    if (deleteError) throw deleteError

    // 5. 新しいラインを挿入
    if (distribution.lines.length > 0) {
      const { error: linesError } = await supabase.from("lines").insert(
        distribution.lines.map((line) => ({
          id: line.id,
          song_id: distribution.id,
          member_id: line.memberId,
          start_time: line.startTime,
          end_time: line.endTime,
          lyrics: line.lyrics,
        })),
      )

      if (linesError) throw linesError
    }

    return true
  } catch (error) {
    console.error("Error saving line distribution:", error)
    return false
  }
}
