import { useQuery } from '@tanstack/react-query'
import type { RawgGame } from '../types'

// Removed MOCK_RESULTS completely to keep production code clean

async function searchRAWG(query: string): Promise<RawgGame[]> {
  // No try/catch here anymore. If fetch fails or res is not ok, 
  // the error will naturally propagate to TanStack Query.
  const res = await fetch(`/api/game-search?query=${encodeURIComponent(query)}`)
  
  if (!res.ok) {
    throw new Error('Failed to fetch games from server')
  }
  
  const data = await res.json()
  return data.results ?? []
}

export function useGameSearch(query: string) {
  const enabled = query.length >= 2

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ['gameSearch', query],
    queryFn: () => searchRAWG(query),
    enabled,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    retry: false, // Optional: prevents React Query from retrying a failed request multiple times before showing the error
  })

  return {
    results: enabled ? (data ?? []) : [],
    loading: isFetching,
    isError,               // Boolean flag indicating if the request failed
    errorMessage: error instanceof Error ? error.message : 'An error occurred',
  }
}