export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          group_id: string
          name: string
          position: string | null
          image_url: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          position?: string | null
          image_url?: string | null
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          position?: string | null
          image_url?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          group_id: string
          title: string
          youtube_id: string
          release_year: string | null
          duration: string | null
          total_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          title: string
          youtube_id: string
          release_year?: string | null
          duration?: string | null
          total_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          title?: string
          youtube_id?: string
          release_year?: string | null
          duration?: string | null
          total_duration?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      lines: {
        Row: {
          id: string
          song_id: string
          member_id: string
          start_time: number
          end_time: number
          lyrics: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          member_id: string
          start_time: number
          end_time: number
          lyrics?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          member_id?: string
          start_time?: number
          end_time?: number
          lyrics?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
