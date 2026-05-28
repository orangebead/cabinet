import { create } from 'zustand'
import { supabase } from '../lib/supabase'
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

interface CabinetState {
  games: CabinetGame[]
  activeList: GameList
  sortBy: 'added_at' | 'rating' | 'title' | 'status'
  filterStatus: GameStatus | 'all'
  searchQuery: string
  loadingGames: boolean

  fetchGames: (userId: string) => Promise<void>
  addGame: (game: RawgGame, list: GameList, userId: string) => Promise<boolean>
  removeGame: (id: string) => Promise<void>
  updateStatus: (id: string, status: GameStatus) => Promise<void>
  updateRating: (id: string, rating: number | null) => Promise<void>
  updateReview: (id: string, review: string | null) => Promise<void>
  moveToList: (id: string, list: GameList) => Promise<void>

  setActiveList: (list: GameList) => void
  setSortBy: (sort: 'added_at' | 'rating' | 'title' | 'status') => void
  setFilterStatus: (status: GameStatus | 'all') => void
  setSearchQuery: (q: string) => void

  getFilteredGames: () => CabinetGame[]
  getStats: () => { total: number; unplayed: number; in_progress: number; completed: number; hundred_percent: number }
}

export const useCabinetStore = create<CabinetState>((set, get) => ({
  games: [],
  activeList: 'cabinet',
  sortBy: 'added_at',
  filterStatus: 'all',
  searchQuery: '',
  loadingGames: true,

  // ── Fetch ──────────────────────────────────────────────
  fetchGames: async (userId) => {
    set({ loadingGames: true })
    const { data, error } = await supabase
      .from('cabinet_games')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (!error && data) set({ games: data as CabinetGame[] })
    set({ loadingGames: false })
  },

  // ── Add ───────────────────────────────────────────────
  addGame: async (game, list, userId) => {
    const existing = get().games.find(g => g.rawg_id === game.id)
    if (existing) return false

    const newGame: Omit<CabinetGame, 'id'> = {
      user_id: userId,
      rawg_id: game.id,
      title: game.name,
      cover: game.background_image,
      status: 'unplayed',
      list,
      rating: null,
      review: null,
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optimistic update with temp id
    const tempId = `temp-${Date.now()}`
    set(state => ({ games: [{ ...newGame, id: tempId }, ...state.games] }))

    const { data, error } = await supabase
      .from('cabinet_games')
      .insert({ ...newGame })
      .select()
      .single()

    if (error) {
      // Roll back
      set(state => ({ games: state.games.filter(g => g.id !== tempId) }))
      return false
    }

    // Replace temp with real row
    set(state => ({
      games: state.games.map(g => g.id === tempId ? data as CabinetGame : g)
    }))
    return true
  },

  // ── Remove ────────────────────────────────────────────
  removeGame: async (id) => {
    const prev = get().games
    set(state => ({ games: state.games.filter(g => g.id !== id) }))

    const { error } = await supabase
      .from('cabinet_games')
      .delete()
      .eq('id', id)

    if (error) set({ games: prev })
  },

  // ── Update status ─────────────────────────────────────
  updateStatus: async (id, status) => {
    const prev = get().games
    set(state => ({ games: state.games.map(g => g.id === id ? { ...g, status } : g) }))

    const { error } = await supabase
      .from('cabinet_games')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) set({ games: prev })
  },

  // ── Update rating ─────────────────────────────────────
  updateRating: async (id, rating) => {
    const prev = get().games
    set(state => ({ games: state.games.map(g => g.id === id ? { ...g, rating } : g) }))

    const { error } = await supabase
      .from('cabinet_games')
      .update({ rating, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) set({ games: prev })
  },

  // ── Update review ─────────────────────────────────────
  updateReview: async (id, review) => {
    const prev = get().games
    set(state => ({ games: state.games.map(g => g.id === id ? { ...g, review } : g) }))

    const { error } = await supabase
      .from('cabinet_games')
      .update({ review, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) set({ games: prev })
  },

  // ── Move to list ──────────────────────────────────────
  moveToList: async (id, list) => {
    const prev = get().games
    set(state => ({ games: state.games.map(g => g.id === id ? { ...g, list } : g) }))

    const { error } = await supabase
      .from('cabinet_games')
      .update({ list, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) set({ games: prev })
  },

  // ── UI state ──────────────────────────────────────────
  setActiveList: (list) => set({ activeList: list, filterStatus: 'all', searchQuery: '' }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  // ── Derived ───────────────────────────────────────────
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