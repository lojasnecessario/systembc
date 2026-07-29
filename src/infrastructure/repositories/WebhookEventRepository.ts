import { getSupabaseClient } from '../database/supabaseClient.js';

export interface WebhookEventData {
  provider: string;
  payload: any;
  status: 'received' | 'processed' | 'failed';
  error_message?: string;
  order_id?: string;
}

export class WebhookEventRepository {
  async create(event: WebhookEventData): Promise<any> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('webhook_events')
      .insert([event])
      .select()
      .single();

    if (error) {
      console.error('Falha ao registrar webhook event:', error.message);
      return null;
    }

    return data;
  }
}
