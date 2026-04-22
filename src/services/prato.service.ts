import api from '../config/api';

export interface Prato {
  id: number;
  barraca_id: number;
  barraca_name?: string | null;
  name: string;
  description: string | null;
  price: string;
  category: string;
  photo_url: string | null;
  available: boolean;
}

export async function listPratos(filters: { category?: string; barraca_id?: number } = {}): Promise<Prato[]> {
  const { data } = await api.get<{ data: Prato[] }>('/pratos', { params: filters });
  return data.data;
}

export async function getPrato(id: number): Promise<Prato> {
  const { data } = await api.get<{ data: Prato }>(`/pratos/${id}`);
  return data.data;
}
