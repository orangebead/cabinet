import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotificationStore } from '../store/notificationStore'
import type { Notification } from '../types'

export function useRealtimeNotifications(userId: string | undefined) {
  const { addNotification, fetchNotifications } = useNotificationStore()

  useEffect(() => {
    if (!userId) return

    fetchNotifications(userId)

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // fetch the from_profile for the new notification
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.from_user_id)
            .single()

          addNotification({ ...payload.new, from_profile: profile } as Notification)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])
}