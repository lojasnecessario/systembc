import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface StoreSettings {
  id: string;
  name: string;
  logo: string | null;
  primary_color: string;
  secondary_color: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
  address: string;
  business_hours: string;
  footer_text: string;
  cnpj?: string;
}

interface SettingsState {
  settings: StoreSettings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: true,
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        set({ settings: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
      set({ loading: false });
    }
  }
}));
