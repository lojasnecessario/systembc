import type { CommerceProvider, WebhookResult } from '../../../domain/commerce/CommerceProvider.js';
import type { Order, Product, Customer } from '../../../domain/models/types.js';
import { VegaMapper } from './mapper.js';
import { createCheckoutRequest } from './createCheckout.js';
import { verifyWebhookSignature } from './verifyWebhook.js';

import { VegaValidationError } from './errors.js';

export class VegaAdapter implements CommerceProvider {
  private webhookSecret: string;
  private apiUrl: string;
  private appUrl: string;
  private apiKey: string;
  private domain: string;

  constructor() {
    this.apiKey = process.env.VEGA_API_KEY || '';
    this.webhookSecret = process.env.VEGA_WEBHOOK_SECRET || process.env.VEGA_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('VEGA_API_KEY não configurada');
    }

    this.appUrl = process.env.APP_URL || 'https://systembc-slpc.vercel.app';
    this.apiUrl = process.env.VEGA_API_URL || 'https://checkout.black-core.site/api/checkout';
    
    // Pega o domínio e remove http(s):// e barras no final para garantir compatibilidade
    let rawDomain = process.env.VEGA_DOMAIN || 'black-core.site';
    rawDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    this.domain = rawDomain;
  }

  async createCheckout(order: Order, products: Product[], customer: Customer): Promise<{ checkoutUrl: string; transactionToken?: string; externalCode?: string }> {
    const payload = VegaMapper.toCheckoutPayload(order, products, customer, this.appUrl);
    
    // Implementação de retry simples para erros de rede
    let attempt = 0;
    const maxRetries = 2;
    
    while (attempt <= maxRetries) {
      try {
        const response = await createCheckoutRequest(payload, this.apiKey, this.apiUrl, this.domain);
        
        const checkoutUrl = response.checkout_url || response.order_url || response.url || response.payment_url || JSON.stringify(response);
        
        const resAny = response as any;
        
        return {
          checkoutUrl,
          transactionToken: response.transaction_token,
          externalCode: payload.external_code,
          paymentStatus: response.payment_status,
          rawResponse: response,
          pix_copy_paste: resAny.pix_copy_paste || (resAny.data && resAny.data.pix_copy_paste),
          qr_code_url: resAny.qr_code_url || (resAny.data && resAny.data.qr_code_url)
        } as any;
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

    const vegaPayload = payload as any;
    const token = vegaPayload.transaction_token || vegaPayload.tansaction_token;
    const externalCode = vegaPayload.external_code;
    const rawStatus = vegaPayload.payment_status || vegaPayload.status;

    if (!token && !externalCode) {
      throw new VegaValidationError('Payload inválido: faltando transaction_token ou external_code');
    }

    // 2. Mapeia para formato interno
    const internalStatus = VegaMapper.toInternalStatus(rawStatus || '');

    return {
      transactionToken: token,
      externalCode: externalCode,
      status: internalStatus,
      rawEvent: vegaPayload
    };
  }
}
