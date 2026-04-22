import api from '../config/api';

export interface ReceitaIngrediente {
  item: string;
  quantidade: string;
}

export type Dificuldade = 'facil' | 'medio' | 'dificil';

export interface Receita {
  id: number;
  prato_id: number | null;
  barraca_id: number | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  rendimento: string | null;
  tempo_preparo_min: number | null;
  dificuldade: Dificuldade | null;
  ingredientes: ReceitaIngrediente[];
  modo_preparo: string[];
  dicas: string | null;
  historia: string | null;
  autor_id: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export async function listReceitas(
  filters: { prato_id?: number; barraca_id?: number } = {}
): Promise<Receita[]> {
  const { data } = await api.get<{ data: Receita[] }>('/receitas', { params: filters });
  return data.data;
}

export async function getReceita(id: number): Promise<Receita> {
  const { data } = await api.get<{ data: Receita }>(`/receitas/${id}`);
  return data.data;
}
