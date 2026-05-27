import { create } from 'zustand'
import type { CabinetGame, GameStatus, GameList, RawgGame } from '../types'

export const STATUSES: GameStatus[] = ['unplayed', 'in_progress', 'completed', 'hundred_percent']

export const STATUS_LABELS: Record<GameStatus, string> = {
  unplayed: 'Unplayed',
  in_progress: 'In Progress',
  completed: 'Completed',
  hundred_percent: '100%',
}

export const STATUS_COLORS: Record<GameStatus, string> = {
  unplayed: '#4a4a5a',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  hundred_percent: '#f59e0b',
}

const mockGames: CabinetGame[] = [
  { id: 1, rawg_id: 3498, title: 'Red Dead Redemption 2', cover: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg', status: 'completed', list: 'cabinet', rating: 9, review: 'A masterpiece. The world building is unmatched.', added_at: '2024-01-10' },
  { id: 2, rawg_id: 41494, title: 'Cyberpunk 2077', cover: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg', status: 'in_progress', list: 'cabinet', rating: 7, review: null, added_at: '2024-02-14' },
  { id: 3, rawg_id: 28, title: 'Red Dead Redemption', cover: 'https://media.rawg.io/media/games/b45/b45575f34285f2c4479c9a5f719d972e.jpg', status: 'unplayed', list: 'cabinet', rating: null, review: null, added_at: '2024-03-01' },
  { id: 4, rawg_id: 13536, title: 'Portal 2', cover: 'https://media.rawg.io/media/games/328/3283617cb7d75d67257fc58339188742.jpg', status: 'hundred_percent', list: 'cabinet', rating: 10, review: 'Perfect game. Nothing else to say.', added_at: '2024-01-20' },
  { id: 5, rawg_id: 5679, title: 'Skyrim', cover: 'https://media.rawg.io/media/games/7cf/7cfc9220b401b7a300e409e539c9afd5.jpg', status: 'completed', list: 'cabinet', rating: 8, review: null, added_at: '2024-02-05' },
  { id: 6, rawg_id: 4200, title: 'Stardew Valley', cover: 'https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg', status: 'in_progress', list: 'cabinet', rating: null, review: null, added_at: '2024-03-10' },
  { id: 7, rawg_id: 3070, title: 'Fallout 4', cover: 'https://media.rawg.io/media/games/d82/d82990b9c67a0d2d0de8e1362e977ac4.jpg', status: 'unplayed', list: 'backlog', rating: null, review: null, added_at: '2024-03-15' },
  { id: 8, rawg_id: 12020, title: 'Left 4 Dead 2', cover: 'https://media.rawg.io/media/games/d58/d588947d4286e7b5e0e12e1bea7d9844.jpg', status: 'unplayed', list: 'wishlist', rating: null, review: null, added_at: '2024-03-18' },
  { id: 9, rawg_id: 4062, title: 'BioShock Infinite', cover: 'https://media.rawg.io/media/games/fc1/fc1307a2774506b5bd65d7e8424664a7.jpg', status: 'unplayed', list: 'wishlist', rating: null, review: null, added_at: '2024-03-20' },
]

let nextId = 10

interface CabinetState {
  games: CabinetGame[]
  activeList: GameList
  sortBy: 'added_at' | 'rating' | 'title' | 'status'
  filterStatus: GameStatus | 'all'
  searchQuery: string
  setActiveList: (list: GameList) => void
  setSortBy: (sort: 'added_at' | 'rating' | 'title' | 'status') => void
  setFilterStatus: (status: GameStatus | 'all') => void
  setSearchQuery: (q: string) => void
  addGame: (game: RawgGame, list?: GameList) => boolean
  removeGame: (id: number) => void
  updateStatus: (id: number, status: GameStatus) => void
  updateRating: (id: number, rating: number | null) => void
  updateReview: (id: number, review: string | null) => void
  moveToList: (id: number, list: GameList) => void
  getFilteredGames: () => CabinetGame[]
  getStats: () => { total: number; unplayed: number; in_progress: number; completed: number; hundred_percent: number }
}

export const useCabinetStore = create<CabinetState>((set, get) => ({
  games: mockGames,
  activeList: 'cabinet',
  sortBy: 'added_at',
  filterStatus: 'all',
  searchQuery: '',

  setActiveList: (list) => set({ activeList: list, filterStatus: 'all', searchQuery: '' }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addGame: (game, list = 'cabinet') => {
    if (get().games.find(g => g.rawg_id === game.id)) return false
    set((state) => ({
      games: [...state.games, {
        id: nextId++,
        rawg_id: game.id,
        title: game.name,
        cover: game.background_image,
        status: 'unplayed',
        list,
        rating: null,
        review: null,
        added_at: new Date().toISOString().split('T')[0],
      }]
    }))
    return true
  },

  removeGame: (id) => set((state) => ({ games: state.games.filter(g => g.id !== id) })),
  updateStatus: (id, status) => set((state) => ({ games: state.games.map(g => g.id === id ? { ...g, status } : g) })),
  updateRating: (id, rating) => set((state) => ({ games: state.games.map(g => g.id === id ? { ...g, rating } : g) })),
  updateReview: (id, review) => set((state) => ({ games: state.games.map(g => g.id === id ? { ...g, review } : g) })),
  moveToList: (id, list) => set((state) => ({ games: state.games.map(g => g.id === id ? { ...g, list } : g) })),

  getFilteredGames: () => {
    const { games, activeList, sortBy, filterStatus, searchQuery } = get()
    let filtered = games.filter(g => g.list === activeList)
    if (filterStatus !== 'all') filtered = filtered.filter(g => g.status === filterStatus)
    if (searchQuery) filtered = filtered.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    if (sortBy === 'rating') return [...filtered].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    if (sortBy === 'title') return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'status') {
      const order: GameStatus[] = ['unplayed', 'in_progress', 'completed', 'hundred_percent']
      return [...filtered].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
    }
    return [...filtered].sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
  },

  getStats: () => {
    const cabinet = get().games.filter(g => g.list === 'cabinet')
    return {
      total: cabinet.length,
      unplayed: cabinet.filter(g => g.status === 'unplayed').length,
      in_progress: cabinet.filter(g => g.status === 'in_progress').length,
      completed: cabinet.filter(g => g.status === 'completed').length,
      hundred_percent: cabinet.filter(g => g.status === 'hundred_percent').length,
    }
  },
}))