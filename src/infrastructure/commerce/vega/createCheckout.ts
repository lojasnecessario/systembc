import type { VegaCheckoutPayload, VegaCheckoutResponse } from './types.js';
import { VegaCheckoutResponseSchema } from './types.js';
import { VegaCommunicationError } from './errors.js';

export async function createCheckoutRequest(payload: VegaCheckoutPayload, apiKey: string, apiUrl: string): Promise<VegaCheckoutResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'x-domain': 'black-core.site'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      throw new VegaCommunicationError(`Erro ao comunicar com Vega: ${response.statusText}`, response.status, responseData);
    }

    const parsed = VegaCheckoutResponseSchema.safeParse(responseData);
    if (!parsed.success) {
      throw new VegaCommunicationError('Resposta da Vega fora do formato esperado', 500, responseData);
    }

    return parsed.data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new VegaCommunicationError('Timeout ao conectar com a API da Vega');
    }
    if (error instanceof VegaCommunicationError) {
      throw error;
    }
    throw new VegaCommunicationError(`Erro inesperado: ${error.message}`);
  }
}
