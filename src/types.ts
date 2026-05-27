export type GameStatus = 'unplayed' | 'in_progress' | 'completed' | 'hundred_percent'
export type GameList = 'cabinet' | 'backlog' | 'wishlist'

export interface CabinetGame {
  id: number
  rawg_id: number
  title: string
  cover: string | null
  status: GameStatus
  list: GameList
  rating: number | null
  review: string | null
  added_at: string
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

export interface CabinetGame {
  id: number
  rawg_id: number
  title: string
  cover: string | null
  status: GameStatus
  list: GameList
  rating: number | null
  review: string | null
  added_at: string
}

export interface RawgGame {
  id: number
  name: string
  background_image: string | null
  released: string | null
  metacritic: number | null
}