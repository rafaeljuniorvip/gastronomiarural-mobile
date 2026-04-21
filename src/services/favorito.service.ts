import api from '../config/api';

export type FavoriteRefType = 'barraca' | 'prato' | 'evento';

export interface Favorito {
  ref_type: FavoriteRefType;
  ref_id: number;
}

export async function listFavoritos(): Promise<Favorito[]> {
  const { data } = await api.get<{ data: Favorito[] }>('/favoritos');
  return data.data;
}

export async function addFavorito(ref_type: FavoriteRefType, ref_id: number): Promise<void> {
  await api.post('/favoritos', { ref_type, ref_id });
}

export async function removeFavorito(ref_type: FavoriteRefType | string, ref_id: number): Promise<void> {
  await api.delete(`/favoritos/${ref_type}/${ref_id}`);
}
