import api from '../config/api';

export type LocalTurismoType =
  | 'hotel'
  | 'pousada'
  | 'restaurante'
  | 'atracao'
  | 'cachoeira'
  | 'igreja'
  | 'trilha'
  | 'mercado'
  | 'servico';

export interface LocalTurismo {
  id: number;
  type: LocalTurismoType;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  gallery: string[];
  address: string | null;
  lat: string | number | null;
  lng: string | number | null;
  phone: string | null;
  whatsapp: string | null;
  website_url: string | null;
  price_range: string | null;
  rating: string | number | null;
  amenities: string[];
  distance_km: string | number | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function listLocais(
  type?: LocalTurismoType
): Promise<LocalTurismo[]> {
  const params = type ? { type } : {};
  const { data } = await api.get<{ data: LocalTurismo[] }>('/turismo', { params });
  return data.data;
}

export async function getLocal(id: number | string): Promise<LocalTurismo> {
  const { data } = await api.get<{ data: LocalTurismo }>(`/turismo/${id}`);
  return data.data;
}
