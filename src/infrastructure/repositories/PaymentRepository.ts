import type { Payment } from '../../domain/models/types.js';
import { getSupabaseClient } from '../database/supabaseClient.js';

export class PaymentRepository {
  async create(payment: Partial<Payment>): Promise<Payment> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar pagamento: ${error.message}`);
    }

    return data as Payment;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) return null;
    return data as Payment;
  }

  async update(id: string, updateData: Partial<Payment>): Promise<Payment> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar pagamento: ${error.message}`);
    }
    
    return { id, ...updateData } as Payment;
  }
}
