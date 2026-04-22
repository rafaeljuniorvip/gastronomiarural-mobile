import api from '../config/api';

export type MapaFeatureType = 'ponto' | 'barraca';

export interface MapaFeature {
  id: string;
  source_id: number;
  type: MapaFeatureType;
  subtype: string;
  name: string | null;
  lat: string;
  lng: string;
  icon: string | null;
}

export async function listMapa(): Promise<MapaFeature[]> {
  const { data } = await api.get<{ data: MapaFeature[] }>('/mapa');
  return data.data;
}

export type MapaAllKind = 'servico' | 'turismo' | 'barraca';

export interface MapaAllItem {
  kind: MapaAllKind;
  subtype: string;
  id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  icon: string;
}

export async function listMapaAll(): Promise<MapaAllItem[]> {
  const { data } = await api.get<{ data: MapaAllItem[] }>('/mapa/all');
  return data.data;
}
