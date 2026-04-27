import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchResult, SearchParams } from '@/types';

export function useSearch(overrides?: Partial<SearchParams>) {
  const [searchParams] = useSearchParams();

  const params: SearchParams = {
    query: overrides?.query ?? searchParams.get('q') ?? '',
    categoryId: overrides?.categoryId ?? searchParams.get('categoria') ?? undefined,
    city: overrides?.city ?? searchParams.get('cidade') ?? undefined,
    state: overrides?.state ?? searchParams.get('estado') ?? undefined,
    page: Number(overrides?.page ?? searchParams.get('pagina') ?? 1),
    limit: Number(overrides?.limit ?? searchParams.get('limite') ?? 20),
    sortBy: (overrides?.sortBy ?? searchParams.get('ordenar') ?? 'relevance') as SearchParams['sortBy'],
    useSemanticSearch: overrides?.useSemanticSearch ?? searchParams.get('ia') === '1',
  };

  const debouncedQuery = useDebounce(params.query, 300);

  return useQuery<SearchResult>({
    queryKey: ['search', { ...params, query: debouncedQuery }],
    queryFn: async () => {
      const response = await api.get<SearchResult>('/trpc/search.search', {
        params: { input: JSON.stringify({ ...params, query: debouncedQuery }) },
      });
      return response.data;
    },
    enabled: debouncedQuery.length > 0,
    placeholderData: (prev) => prev,
  });
}

export function useAutocomplete(query: string) {
  const debouncedQuery = useDebounce(query, 200);

  return useQuery({
    queryKey: ['autocomplete', debouncedQuery],
    queryFn: async () => {
      const response = await api.get('/trpc/search.autocomplete', {
        params: { input: JSON.stringify({ query: debouncedQuery }) },
      });
      return response.data as {
        companies: Array<{ id: string; name: string; logoUrl?: string; slug: string }>;
        categories: Array<{ id: string; name: string; slug: string; icon?: string }>;
      };
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });
}
