export type GameStatus = 'unplayed' | 'in_progress' | 'completed' | 'hundred_percent'
export type GameList = 'cabinet' | 'backlog' | 'wishlist'

export interface CabinetGame {
  id: string
  user_id: string
  rawg_id: number
  title: string
  cover: string | null
  status: GameStatus
  list: GameList
  rating: number | null
  review: string | null
  added_at: string
  updated_at: string
}

export interface RawgGame {
  id: number
  name: string
  background_image: string | null
  released: string | null
  metacritic: number | null
}

export interface GameDetails {
  released: string | null
  publishers: { name: string }[]
}

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  is_public: boolean
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}