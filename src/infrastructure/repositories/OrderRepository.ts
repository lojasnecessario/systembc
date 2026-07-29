import type { Order } from '../../domain/models/types.js';
import { getSupabaseClient } from '../database/supabaseClient.js';

export class OrderRepository {
  async create(order: Partial<Order>): Promise<Order> {
    const supabase = getSupabaseClient();
    
    // Extrai os items antes de inserir na tabela orders (que não possui coluna items)
    const { items, ...orderData } = order;

    // 1. Cria o pedido na tabela orders
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Erro ao criar pedido: ${orderError.message}`);
    }

    // 2. Insere os itens na tabela order_items, se existirem
    if (items && items.length > 0) {
      const orderItemsToInsert = items.map(item => ({
        order_id: orderRecord.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        throw new Error(`Erro ao salvar itens do pedido: ${itemsError.message}`);
      }
    }

    return { ...orderRecord, items } as Order;
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
