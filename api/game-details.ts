import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing game id' })
  }

  const apiKey = process.env.RAWG_K
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  try {
    const rawgRes = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`)
    const data = await rawgRes.json()
    res.status(200).json(data)
  } catch {
    res.status(500).json({ error: 'Failed to fetch game details' })
  }
}