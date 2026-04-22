import api from '../config/api';

export type FaqCategory =
  | 'geral'
  | 'entrada'
  | 'horarios'
  | 'pagamentos'
  | 'mobilidade'
  | 'acessibilidade'
  | 'oficinas'
  | 'avaliacoes'
  | 'emergencia';

export const FAQ_CATEGORIES: FaqCategory[] = [
  'geral',
  'entrada',
  'horarios',
  'pagamentos',
  'mobilidade',
  'acessibilidade',
  'oficinas',
  'avaliacoes',
  'emergencia',
];

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  geral: 'Geral',
  entrada: 'Entrada',
  horarios: 'Horários',
  pagamentos: 'Pagamentos',
  mobilidade: 'Mobilidade',
  acessibilidade: 'Acessibilidade',
  oficinas: 'Oficinas',
  avaliacoes: 'Avaliações',
  emergencia: 'Emergência',
};

export interface FaqItem {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqGroup {
  category: FaqCategory;
  items: FaqItem[];
}

export async function listFaq(): Promise<FaqItem[]> {
  const { data } = await api.get<{ data: FaqItem[] }>('/faq');
  return data.data;
}

export async function listFaqGrouped(): Promise<FaqGroup[]> {
  const { data } = await api.get<{ data: FaqGroup[] }>('/faq/grouped');
  return data.data;
}
