import api from '../config/api';

export interface Cupom {
  id: number;
  patrocinador_id: number;
  code: string;
  description: string;
  valid_until: string | null;
  max_redemptions: number | null;
  current_redemptions: number;
  active: boolean;
  created_at: string;
  patrocinador_name: string;
  patrocinador_logo_url: string | null;
  patrocinador_website_url: string | null;
}

export interface CupomResgateWithCupom {
  id: number;
  cupom_id: number;
  user_id: number;
  redeemed_at: string;
  code: string;
  description: string;
  valid_until: string | null;
  patrocinador_id: number;
  patrocinador_name: string;
  patrocinador_logo_url: string | null;
}

export interface RedeemResult {
  resgate: {
    id: number;
    cupom_id: number;
    user_id: number;
    redeemed_at: string;
  };
  cupom: Cupom;
}

export async function listMyCoupons(): Promise<Cupom[]> {
  const { data } = await api.get<{ data: Cupom[] }>('/cupons/mine');
  return data.data;
}

export async function listMyRedeemed(): Promise<CupomResgateWithCupom[]> {
  const { data } = await api.get<{ data: CupomResgateWithCupom[] }>('/cupons/my-redeemed');
  return data.data;
}

export async function getCupomByCode(code: string): Promise<Cupom> {
  const normalized = code.trim().toUpperCase();
  const { data } = await api.get<{ data: Cupom }>(`/cupons/by-code/${encodeURIComponent(normalized)}`);
  return data.data;
}

export async function redeemCoupon(code: string): Promise<RedeemResult> {
  const normalized = code.trim().toUpperCase();
  const { data } = await api.post<{ data: RedeemResult }>('/cupons/redeem', { code: normalized });
  return data.data;
}
