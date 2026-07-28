import { Product } from '../../domain/models/types';
import { getSupabaseClient } from '../database/supabaseClient';

export class ProductRepository {
  async getById(id: string): Promise<Product | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Product;
  }
}
