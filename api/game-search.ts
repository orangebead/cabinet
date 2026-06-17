import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { query } = req.query

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing search query' })
  }

  const apiKey = process.env.RAWG_K
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  try {
    const rawgRes = await fetch(
      `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${apiKey}&page_size=8`
    )
    const data = await rawgRes.json()
    res.status(200).json(data)
  } catch {
    res.status(500).json({ error: 'Failed to fetch games' })
  }
}