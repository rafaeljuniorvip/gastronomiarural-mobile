import api from '../config/api';

export type MarcadorKind = 'experimentei' | 'quero_provar';

export interface Marcador {
  id: number;
  user_id: number;
  prato_id: number;
  kind: MarcadorKind;
  notes: string | null;
  rating: number | null;
  created_at: string;
}

export interface MarcadorMine extends Marcador {
  prato_name: string;
  prato_photo_url: string | null;
  prato_price: string;
  prato_category: string;
  barraca_id: number;
  barraca_name: string;
}

export interface MarcadorStatus {
  experimentei: boolean;
  quero_provar: boolean;
}

export interface AddMarkerInput {
  prato_id: number;
  kind: MarcadorKind;
  notes?: string;
  rating?: number;
}

export async function listMyMarkers(): Promise<MarcadorMine[]> {
  const { data } = await api.get<{ data: MarcadorMine[] }>('/marcadores/mine');
  return data.data;
}

export async function addMarker(input: AddMarkerInput): Promise<Marcador> {
  const { data } = await api.post<{ data: Marcador }>('/marcadores', input);
  return data.data;
}

export async function removeMarker(prato_id: number, kind: MarcadorKind): Promise<void> {
  await api.delete(`/marcadores/${prato_id}/${kind}`);
}

export async function getMarkerStatus(prato_id: number): Promise<MarcadorStatus> {
  const { data } = await api.get<{ data: MarcadorStatus }>(`/marcadores/status/${prato_id}`);
  return data.data;
}
