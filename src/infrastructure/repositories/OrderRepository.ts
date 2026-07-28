import type { Order } from '../../domain/models/types';
import { getSupabaseClient } from '../database/supabaseClient';

export class OrderRepository {
  async create(order: Partial<Order>): Promise<Order> {
    const supabase = getSupabaseClient();
    
    // Supondo que a tabela seja "orders"
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar pedido: ${error.message}`);
    }

    return data as Order;
  }

  async findByExternalCode(externalCode: string): Promise<Order | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('external_code', externalCode)
      .single();

    if (error || !data) return null;
    return data as Order;
  }

  async findByTransactionToken(token: string): Promise<Order | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_token', token)
      .single();

    if (error || !data) return null;
    return data as Order;
  }

  async update(id: string, updateData: Partial<Order>): Promise<Order> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    }
    
    return data as Order;
  }
}
