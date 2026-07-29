import type { Order, Product } from '../models/types.js';

export interface CommerceProvider {
  /**
   * Cria um checkout no provedor e retorna a URL de redirecionamento,
   * bem como o transaction_token se houver.
   */
  createCheckout(order: Order, products: Product[]): Promise<{ checkoutUrl: string; transactionToken?: string; externalCode?: string }>;

  /**
   * Valida e processa o webhook recebido
   */
  handleWebhook(payload: any, signature?: string): Promise<WebhookResult>;
}

export interface WebhookResult {
  transactionToken: string;
  externalCode?: string;
  status: string; // O status mapeado internamente ou o original dependendo da sua escolha, preferencialmente interno (PaymentStatus)
  rawEvent: any;
}
