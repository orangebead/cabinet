import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile, CabinetGame } from '../types'

interface ProfileState {
  profile: Profile | null
  loadingProfile: boolean

  fetchProfile: (userId: string) => Promise<Profile | null>
  createProfile: (userId: string, username: string, displayName?: string) => Promise<{ error: string | null }>
  updateProfile: (userId: string, updates: Partial<Pick<Profile, 'display_name' | 'bio' | 'is_public'>>) => Promise<void>

  // For viewing other profiles
  getProfileByUsername: (username: string) => Promise<Profile | null>
  getProfileGames: (userId: string) => Promise<CabinetGame[]>
  getFollowerCount: (userId: string) => Promise<number>
  getFollowingCount: (userId: string) => Promise<number>
  isFollowing: (followerId: string, followingId: string) => Promise<boolean>
  follow: (followerId: string, followingId: string) => Promise<void>
  unfollow: (followerId: string, followingId: string) => Promise<void>
  searchProfiles: (query: string) => Promise<Profile[]>
  getFollowing: (userId: string) => Promise<Profile[]>
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loadingProfile: true,

  fetchProfile: async (userId) => {
    set({ loadingProfile: true })
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    set({ profile: data ?? null, loadingProfile: false })
    return data ?? null
  },

  createProfile: async (userId, username, displayName) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, username: username.toLowerCase().trim(), display_name: displayName || null })
      .select()
      .single()
    if (error) {
      if (error.code === '23505') return { error: 'Username already taken.' }
      return { error: error.message }
    }
    set({ profile: data })
    return { error: null }
  },

  updateProfile: async (userId, updates) => {
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (data) set({ profile: data })
  },

  getProfileByUsername: async (username) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single()
    return data ?? null
  },

  getProfileGames: async (userId) => {
    const { data } = await supabase
      .from('cabinet_games')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    return (data ?? []) as CabinetGame[]
  },

  getFollowerCount: async (userId) => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
    return count ?? 0
  },

  getFollowingCount: async (userId) => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)
    return count ?? 0
  },

  isFollowing: async (followerId, followingId) => {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    return !!data
  },

  follow: async (followerId, followingId) => {
    await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
  },

  unfollow: async (followerId, followingId) => {
    await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
  },

  searchProfiles: async (query) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10)
    return data ?? []
  },

  getFollowing: async (userId) => {
    const { data } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', userId)
    return (data?.map((f: any) => f.profiles) ?? []) as Profile[]
  },
}))