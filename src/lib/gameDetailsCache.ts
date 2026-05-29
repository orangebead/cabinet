import type { GameDetails } from '../types'

const cache = new Map<number, GameDetails>()

const RAWG_KEY = import.meta.env.RAWG_K

export async function fetchGameDetails(rawg_id: number): Promise<GameDetails | null> {
  if (cache.has(rawg_id)) return cache.get(rawg_id)!

  try {
    const url = RAWG_KEY
      ? `https://api.rawg.io/api/games/${rawg_id}?key=${RAWG_KEY}`
      : null

    if (!url) {
      const mock: GameDetails = { released: '2018-10-26', publishers: [{ name: 'Rockstar Games' }] }
      cache.set(rawg_id, mock)
      return mock
    }

    const res = await fetch(url)
    const data: GameDetails = await res.json()
    cache.set(rawg_id, data)
    return data
  } catch {
    return null
  }
}