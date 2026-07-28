import { CheckoutService } from '../../src/application/services/CheckoutService';
import { OrderRepository } from '../../src/infrastructure/repositories/OrderRepository';
import { ProductRepository } from '../../src/infrastructure/repositories/ProductRepository';
import { PaymentRepository } from '../../src/infrastructure/repositories/PaymentRepository';
import { WebhookEventRepository } from '../../src/infrastructure/repositories/WebhookEventRepository';
import { VegaAdapter } from '../../src/infrastructure/commerce/vega/VegaAdapter';
import { VegaValidationError } from '../../src/infrastructure/commerce/vega/errors';

const orderRepo = new OrderRepository();
const productRepo = new ProductRepository();
const paymentRepo = new PaymentRepository();
const webhookEventRepo = new WebhookEventRepository();
const vegaAdapter = new VegaAdapter();
const checkoutService = new CheckoutService(orderRepo, productRepo, paymentRepo, webhookEventRepo, vegaAdapter);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;
    // O header de assinatura varia, exemplo comum: 'x-signature' ou authorization
    const signature = req.headers['x-signature'] || req.headers['authorization'];

    await checkoutService.processWebhook(payload, signature);

    return res.status(200).json({ received: true });

  } catch (error: any) {
    console.error("Erro no webhook da Vega:", error);
    
    if (error instanceof VegaValidationError) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
}
