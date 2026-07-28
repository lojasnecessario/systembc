import { CommerceProvider, WebhookResult } from '../../../domain/commerce/CommerceProvider';
import { Order, Product } from '../../../domain/models/types';
import { VegaMapper } from './mapper';
import { createCheckoutRequest } from './createCheckout';
import { verifyWebhookSignature } from './verifyWebhook';
import { VegaWebhookPayload } from './types';
import { VegaValidationError } from './errors';

export class VegaAdapter implements CommerceProvider {
  private webhookSecret: string;
  private apiUrl: string;
  private appUrl: string;

  constructor() {
    this.apiKey = process.env.VEGA_API_KEY || '';
    this.webhookSecret = process.env.VEGA_WEBHOOK_SECRET || process.env.VEGA_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('VEGA_API_KEY não configurada');
    }

    this.appUrl = process.env.APP_URL || 'https://systembc-slpc.vercel.app';
    // Se a Vega não tiver um endpoint oficial nas vars, podemos usar o antigo como fallback ou forçar o erro. O ideal é deixar a var cuidar disso.
    this.apiUrl = process.env.VEGA_API_URL || 'https://checkout.seudominioaprovado.com/api/checkout';
  }

  async createCheckout(order: Order, products: Product[]): Promise<{ checkoutUrl: string; transactionToken?: string; externalCode?: string }> {
    const payload = VegaMapper.toCheckoutPayload(order, products, this.appUrl);
    
    // Implementação de retry simples para erros de rede
    let attempt = 0;
    const maxRetries = 2;
    
    while (attempt <= maxRetries) {
      try {
        const response = await createCheckoutRequest(payload, this.apiKey, this.apiUrl);
        
        const checkoutUrl = response.checkout_url || response.url || response.payment_url;
        
        if (!checkoutUrl) {
          throw new Error('URL de checkout não retornada pela Vega');
        }

        return {
          checkoutUrl,
          transactionToken: response.transaction_token,
          externalCode: payload.external_code
        };
      } catch (error: any) {
        attempt++;
        if (attempt > maxRetries || (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)) {
          // Não retentar erros 4xx (problema no payload)
          throw error;
        }
        // Espera um pouco antes de tentar novamente (backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error('Falha ao criar checkout após retentativas');
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    // 1. Valida integridade do Webhook
    verifyWebhookSignature(payload, signature, this.webhookSecret);

    const vegaPayload = payload as VegaWebhookPayload;

    if (!vegaPayload.transaction_token && !vegaPayload.external_code) {
      throw new VegaValidationError('Payload inválido: faltando transaction_token ou external_code');
    }

    // 2. Mapeia para formato interno
    const internalStatus = VegaMapper.toInternalStatus(vegaPayload.status);

    return {
      transactionToken: vegaPayload.transaction_token,
      externalCode: vegaPayload.external_code,
      status: internalStatus,
      rawEvent: vegaPayload
    };
  }
}
