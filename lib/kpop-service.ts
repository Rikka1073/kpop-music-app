// Supabaseu306eu4ee3u308fu308au306bu30e2u30c3u30afu30c7u30fcu30bfu3092u4f7fu7528u3059u308bu3088u3046u306bu4feeu6b63
import { supabase } from "./supabase"
import type { LineDistribution } from "@/types/line-distribution"
import { mockGroups, mockDistributions } from './mock-data'

// u74b0u5883u5909u6570u304cu8a2du5b9au3055u308cu3066u3044u308bu304bu78bau8a8du3057u3001u30e2u30c3u30afu30c7u30fcu30bfu3092u4f7fu7528u3059u308bu304bu5224u65adu3059u308b
const useSupabase = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-supabase-project.supabase.co' && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key'

console.log('Using Supabase:', useSupabase)

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
  // Supabaseu304cu4f7fu7528u53efu80fdu306au5834u5408u306fu5b9fu969bu306eu30c7u30fcu30bfu3092u53d6u5f97
  if (useSupabase) {
    try {
      const { data: groups, error: groupsError } = await supabase.from("groups").select("*").order("name")

      if (groupsError) {
        console.error("Error fetching groups:", groupsError)
        return mockGroups // u30a8u30e9u30fcu6642u306fu30e2u30c3u30afu30c7u30fcu30bfu3092u8fd4u3059
      }

      const { data: songs, error: songsError } = await supabase.from("songs").select("*").order("title")

      if (songsError) {
        console.error("Error fetching songs:", songsError)
        return mockGroups // u30a8u30e9u30fcu6642u306fu30e2u30c3u30afu30c7u30fcu30bfu3092u8fd4u3059
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
            distributionId: song.id, // songu306eIDu3092distributionIdu3068u3057u3066u4f7fu7528
          })),
      }))
    } catch (error) {
      console.error("Error in getGroups:", error)
      return mockGroups // u4f8bu5916u767au751fu6642u306fu30e2u30c3u30afu30c7u30fcu30bfu3092u8fd4u3059
    }
  }
  
  // Supabaseu304cu4f7fu7528u3067u304du306au3044u5834u5408u306fu30e2u30c3u30afu30c7u30fcu30bfu3092u8fd4u3059
  console.log('Using mock data for groups')
  return mockGroups
}

// 特定の曲の歌割りデータを取得
export async function getLineDistribution(songId: string): Promise<LineDistribution | null> {
  // Supabaseが使用可能な場合は実際のデータを取得
  if (useSupabase) {
    try {
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
        // モックデータから該当するdistributionを返す
        return mockDistributions[songId] || null
      }

      // メンバー情報を取得
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("*")
        .eq("group_id", song.group_id)
        .order("name")

      if (membersError) {
        console.error("Error fetching members:", membersError)
        return mockDistributions[songId] || null
      }

      // ライン情報を取得
      const { data: lines, error: linesError } = await supabase
        .from("lines")
        .select("*")
        .eq("song_id", songId)
        .order("start_time")

      if (linesError) {
        console.error("Error fetching lines:", linesError)
        return mockDistributions[songId] || null
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
    } catch (error) {
      console.error("Error in getLineDistribution:", error)
      return mockDistributions[songId] || null
    }
  }
  
  // Supabaseが使用できない場合はモックデータを返す
  console.log('Using mock data for line distribution')
  return mockDistributions[songId] || null
}

// 歌割りデータを保存
export async function saveLineDistribution(distribution: LineDistribution): Promise<boolean> {
  // Supabaseが使用可能な場合は実際にデータを保存
  if (useSupabase) {
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
  
  // Supabaseが使用できない場合はモックデータを更新したように見せかける
  console.log('Using mock data for saving line distribution')
  console.log('Would save distribution:', distribution)
  
  // モックデータに保存（実際のアプリケーションでは永続化されません）
  mockDistributions[distribution.id] = distribution
  
  return true
}
