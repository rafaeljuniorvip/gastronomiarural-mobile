import api from '../config/api';

export interface Avaliacao {
  id: number;
  user_id: number;
  user_name?: string | null;
  user_avatar_url?: string | null;
  prato_id: number | null;
  barraca_id: number | null;
  evento_id: number | null;
  rating: number;
  comment: string | null;
  photos: string[];
  approved: boolean;
  owner_reply: string | null;
  created_at: string;
}

export interface AvaliacaoFilter {
  prato_id?: number;
  barraca_id?: number;
  evento_id?: number;
}

export interface AvaliacaoInput {
  prato_id?: number;
  barraca_id?: number;
  evento_id?: number;
  rating: number;
  comment?: string;
  photos?: string[];
}

export async function listAvaliacoes(filter: AvaliacaoFilter): Promise<Avaliacao[]> {
  const { data } = await api.get<{ data: Avaliacao[] }>('/avaliacoes', { params: filter });
  return data.data;
}

export async function createAvaliacao(input: AvaliacaoInput): Promise<Avaliacao> {
  const { data } = await api.post<{ data: Avaliacao }>('/avaliacoes', input);
  return data.data;
}

export interface UploadResult {
  url: string;
}

export async function uploadAvaliacaoPhoto(uri: string): Promise<string> {
  const filename = uri.split('/').pop() || `photo_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  const type = ext === 'png' ? 'image/png' : 'image/jpeg';

  const form = new FormData();
  form.append('file', { uri, name: filename, type } as unknown as Blob);

  const { data } = await api.post<{ data: UploadResult }>('/upload', form, {
    params: { type: 'avaliacoes' },
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (d) => d,
  });
  return data.data.url;
}
