import api from '../config/api';

export interface EdicaoPassada {
  id: number;
  edition: number;
  year: number;
  start_date: string | null;
  end_date: string | null;
  theme: string | null;
  description: string | null;
  highlights: string[];
  cover_url: string | null;
  gallery: string[];
  visitors_count: number | null;
  economy_impact_brl: string | null;
  curiosities: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listEdicoes(): Promise<EdicaoPassada[]> {
  const { data } = await api.get<{ data: EdicaoPassada[] }>('/edicoes');
  return data.data;
}

export async function getEdicao(id: number): Promise<EdicaoPassada> {
  const { data } = await api.get<{ data: EdicaoPassada }>(`/edicoes/${id}`);
  return data.data;
}
