import api from '../config/api';

export interface Oficina {
  id: number;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number | null;
  location: string | null;
  total_seats: number | null;
  vagas_preenchidas: number;
  cover_url: string | null;
  type?: string;
}

export interface OficinaDetail extends Oficina {
  inscrito?: boolean;
  qr_code?: string | null;
}

export async function listOficinas(): Promise<Oficina[]> {
  const { data } = await api.get<{ data: Oficina[] }>('/eventos/oficinas');
  return data.data;
}

export async function getOficina(id: number): Promise<OficinaDetail> {
  const { data } = await api.get<{ data: OficinaDetail }>(`/eventos/${id}`);
  return data.data;
}

export async function inscrever(id: number): Promise<{ qr_code: string }> {
  const { data } = await api.post<{ data: { qr_code: string } }>(`/eventos/${id}/inscricoes`);
  return data.data;
}

export async function cancelarInscricao(id: number): Promise<void> {
  await api.delete(`/eventos/${id}/inscricoes`);
}
