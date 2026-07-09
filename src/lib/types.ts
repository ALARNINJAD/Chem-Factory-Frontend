export interface User {
  id: number;
  username: string;
  balance: number;
  xp: number;
  level: number;
}

export interface Material {
  id: number;
  user_id?: number;
  first_ingredient_id?: number;
  second_ingredient_id?: number;
  name: string;
  price: number;
  mix_time?: number;
}

export interface InventoryItem {
  id: number;
  user_id: number;
  material_id: number;
  material_name: string;
  amount: number;
  date_time: string;
}

export interface MarketItem {
  id: number;
  user_id: number;
  material_id: number;
  amount: number;
  price: number;
  date_time: string;
}

export interface MixerEntry {
  id: number;
  user_id: number;
  first_ingredient_id: number;
  second_ingredient_id: number;
  amount: number;
  date_time: string;
}

export interface AuthResponse {
  token: string;
}

export interface ProfileResponse {
  user: User;
}
