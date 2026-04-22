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

export interface ListPatrocinadoresOptions {
  tiers?: string[];
}

export async function listPatrocinadores(
  options: ListPatrocinadoresOptions = {}
): Promise<Patrocinador[]> {
  const params: Record<string, string> = {};
  if (options.tiers && options.tiers.length > 0) {
    params.tier = options.tiers.join(',');
  }
  const { data } = await api.get<{ data: Patrocinador[] }>('/patrocinadores', { params });
  return data.data;
}
