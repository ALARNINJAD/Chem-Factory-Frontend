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

export interface MaterialCatalogItem extends Material {
  first_ingredient_name?: string;
  second_ingredient_name?: string;
}

export interface MaterialListResponse {
  materials: MaterialCatalogItem[];
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
  username: string;
  material_name: string;
  amount: number;
  price: number;
  date_time: string;
}

export interface MixerEntry {
  id: number;
  user_id: number;
  first_ingredient_id: number;
  second_ingredient_id: number;
  username: string;
  material_name: string;
  first_ingredient_name: string;
  second_ingredient_name: string;
  amount: number;
  date_time: string;
  remaining_seconds: number;
  is_new: boolean;
}

export interface PickResult {
  is_picked: boolean;
  is_new: boolean;
  remaining_seconds: number;
}

export interface MixerListResponse {
  mixes: MixerEntry[];
}

export interface AuthResponse {
  token: string;
}

export interface MessageResponse {
  message: string;
}
