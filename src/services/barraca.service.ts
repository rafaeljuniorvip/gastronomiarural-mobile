import api from '../config/api';

export interface Barraca {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  opening_hours: string | null;
  status: string;
  primary_color: string;
}

export interface BarracaDetail extends Barraca {
  history: string | null;
  contact_phone: string | null;
  pratos: Array<{
    id: number;
    name: string;
    description: string | null;
    price: string;
    category: string;
    photo_url: string | null;
  }>;
}

export async function listBarracas(): Promise<Barraca[]> {
  const { data } = await api.get<{ data: Barraca[] }>('/barracas');
  return data.data;
}

export async function getBarraca(id: number): Promise<BarracaDetail> {
  const { data } = await api.get<{ data: BarracaDetail }>(`/barracas/${id}`);
  return data.data;
}
