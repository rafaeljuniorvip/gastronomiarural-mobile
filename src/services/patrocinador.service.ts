import api from '../config/api';

export type PatrocinadorTier = 'diamante' | 'ouro' | 'prata' | 'bronze' | 'apoio' | string;

export interface Patrocinador {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: PatrocinadorTier;
  display_order?: number;
}

export async function listPatrocinadores(): Promise<Patrocinador[]> {
  const { data } = await api.get<{ data: Patrocinador[] }>('/patrocinadores');
  return data.data;
}
