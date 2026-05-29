import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Notification } from '../types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  open: boolean

  fetchNotifications: (userId: string) => Promise<void>
  markAllRead: (userId: string) => Promise<void>
  markRead: (id: string) => Promise<void>
  addNotification: (n: Notification) => void
  setOpen: (open: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  open: false,

  fetchNotifications: async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*, from_profile:profiles!notifications_from_user_id_fkey(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)

    const notifications = (data ?? []) as Notification[]
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    })
  },

  markAllRead: async (userId) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  markRead: async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  addNotification: (n) => set(state => ({
    notifications: [n, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),

  setOpen: (open) => set({ open }),
}))