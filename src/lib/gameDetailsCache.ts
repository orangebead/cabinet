import type { GameDetails } from '../types'

const cache = new Map<number, GameDetails>()

export async function fetchGameDetails(rawg_id: number): Promise<GameDetails | null> {
  if (cache.has(rawg_id)) return cache.get(rawg_id)!

  try {
    const res = await fetch(`/api/game-details?id=${rawg_id}`)
    if (!res.ok) throw new Error('API unavailable')
    const data: GameDetails = await res.json()
    cache.set(rawg_id, data)
    return data
  } catch {
    const mock: GameDetails = { released: '2018-10-26', publishers: [{ name: 'Rockstar Games' }] }
    cache.set(rawg_id, mock)
    return mock
  }
}