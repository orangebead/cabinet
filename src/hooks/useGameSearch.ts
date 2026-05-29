import { useQuery } from '@tanstack/react-query'
import type { RawgGame } from '../types'

const RAWG_KEY = import.meta.env.RAWG_K

const MOCK_RESULTS: RawgGame[] = [
  { id: 3498, name: 'Red Dead Redemption 2', background_image: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg', released: '2018-10-26', metacritic: 97 },
  { id: 41494, name: 'Cyberpunk 2077', background_image: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg', released: '2020-12-10', metacritic: 86 },
  { id: 13536, name: 'Portal 2', background_image: 'https://media.rawg.io/media/games/328/3283617cb7d75d67257fc58339188742.jpg', released: '2011-04-19', metacritic: 95 },
  { id: 5679, name: 'The Elder Scrolls V: Skyrim', background_image: 'https://media.rawg.io/media/games/7cf/7cfc9220b401b7a300e409e539c9afd5.jpg', released: '2011-11-11', metacritic: 94 },
  { id: 4200, name: 'Stardew Valley', background_image: 'https://media.rawg.io/media/games/713/713269608dc8f2f40f5a670a14b2de94.jpg', released: '2016-02-26', metacritic: 89 },
  { id: 28, name: 'Red Dead Redemption', background_image: 'https://media.rawg.io/media/games/b45/b45575f34285f2c4479c9a5f719d972e.jpg', released: '2010-05-18', metacritic: 95 },
  { id: 3070, name: 'Fallout 4', background_image: 'https://media.rawg.io/media/games/d82/d82990b9c67a0d2d0de8e1362e977ac4.jpg', released: '2015-11-10', metacritic: 84 },
  { id: 4062, name: 'BioShock Infinite', background_image: 'https://media.rawg.io/media/games/fc1/fc1307a2774506b5bd65d7e8424664a7.jpg', released: '2013-03-26', metacritic: 94 },
  { id: 12020, name: 'Left 4 Dead 2', background_image: 'https://media.rawg.io/media/games/d58/d588947d4286e7b5e0e12e1bea7d9844.jpg', released: '2009-11-17', metacritic: 89 },
  { id: 58175, name: 'God of War', background_image: 'https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be73.jpg', released: '2018-04-20', metacritic: 94 },
  { id: 58134, name: 'Hollow Knight', background_image: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg', released: '2017-02-24', metacritic: 87 },
  { id: 422, name: 'Terraria', background_image: 'https://media.rawg.io/media/games/f46/f466571d536f2e3ea9e815ad17177501.jpg', released: '2011-05-16', metacritic: 85 },
]

async function searchRAWG(query: string): Promise<RawgGame[]> {
  if (!RAWG_KEY) {
    return MOCK_RESULTS.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
  }
  const res = await fetch(
    `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${RAWG_KEY}&page_size=8`
  )
  const data = await res.json()
  return data.results ?? []
}

export function useGameSearch(query: string) {
  const enabled = query.length >= 2

  const { data, isFetching } = useQuery({
    queryKey: ['gameSearch', query],
    queryFn: () => searchRAWG(query),
    enabled,
    staleTime: 1000 * 60 * 5,  // cache search results for 5 minutes
    placeholderData: (prev) => prev, // keep previous results while new ones load
  })

  return {
    results: enabled ? (data ?? []) : [],
    loading: isFetching,
  }
}