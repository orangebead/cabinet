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
  developers?: { name: string }[]
  metacritic?: number
  esrb_rating?: { name: string }
  platforms?: { platform: { name: string; slug: string } }[]
  tags?: { id: number; name: string; slug: string }[]
  stores?: { store: { id: number; name: string; slug: string }; url: string }[]
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

export type NotificationType = 'follow' | 'game_added' | 'review_written'

export interface Notification {
  id: string
  user_id: string
  from_user_id: string
  type: NotificationType
  read: boolean
  created_at: string
  from_profile?: Profile
}

export interface FeedItem {
  id: string
  user_id: string
  profile: Profile
  type: 'game_added' | 'status_changed' | 'review_written' | 'rating_given'
  game_title: string
  game_cover: string | null
  meta: string // e.g. "marked as Completed" or "gave it 8/10"
  created_at: string
}