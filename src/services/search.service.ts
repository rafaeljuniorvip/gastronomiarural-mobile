import api from '../config/api';

export type SearchKind = 'barraca' | 'prato' | 'receita' | 'evento' | 'pessoa' | 'turismo';

export interface SearchResult {
  kind: SearchKind;
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  score: number;
}

export async function globalSearch(q: string, limit = 30): Promise<SearchResult[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const { data } = await api.get<{ data: SearchResult[] }>('/search', {
    params: { q: term, limit },
  });
  return data.data;
}
