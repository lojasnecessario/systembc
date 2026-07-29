import type { Order, Product, Customer } from '../models/types.js';

export interface CommerceProvider {
  /**
   * Cria um checkout no provedor e retorna a URL de redirecionamento,
   * bem como o transaction_token se houver.
   */
  createCheckout(order: Order, products: Product[], customer: Customer): Promise<{ 
    checkoutUrl: string; 
    transactionToken?: string; 
    externalCode?: string;
    pix_copy_paste?: string;
    qr_code_url?: string;
    payment_status?: string;
    rawResponse?: any;
  }>;

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
