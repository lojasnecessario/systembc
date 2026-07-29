import { supabase } from '../../lib/supabase.js';
import type { Customer } from '../../domain/models/types.js';

export class CustomerRepository {
  async getByEmailOrCpf(email: string, cpf: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`email.eq.${email},cpf.eq.${cpf}`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Customer getByEmailOrCpf error:', error);
      throw error;
    }

    return data as Customer | null;
  }

  async create(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) {
      console.error('Customer create error:', error);
      throw error;
    }
    return data as Customer;
  }

  async update(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Customer update error:', error);
      throw error;
    }
    return data as Customer;
  }
}
