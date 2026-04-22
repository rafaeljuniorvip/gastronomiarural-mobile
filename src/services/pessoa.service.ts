import api from '../config/api';

export type PessoaRole = 'cozinheira' | 'artista' | 'artesao' | 'produtor';

export interface PessoaSocial {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
  website?: string;
}

export interface Pessoa {
  id: number;
  name: string;
  slug: string;
  role: PessoaRole;
  bio: string | null;
  photo_url: string | null;
  social: PessoaSocial;
  active: boolean;
  sort_order: number;
}

export async function listPessoas(
  filters: { role?: PessoaRole } = {}
): Promise<Pessoa[]> {
  const { data } = await api.get<{ data: Pessoa[] }>('/pessoas', { params: filters });
  return data.data;
}

export async function getPessoa(id: number | string): Promise<Pessoa> {
  const { data } = await api.get<{ data: Pessoa }>(`/pessoas/${id}`);
  return data.data;
}
