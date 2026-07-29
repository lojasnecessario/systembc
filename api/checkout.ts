import { CheckoutService } from '../src/application/services/CheckoutService.js';
import { OrderRepository } from '../src/infrastructure/repositories/OrderRepository.js';
import { ProductRepository } from '../src/infrastructure/repositories/ProductRepository.js';
import { PaymentRepository } from '../src/infrastructure/repositories/PaymentRepository.js';
import { WebhookEventRepository } from '../src/infrastructure/repositories/WebhookEventRepository.js';
import { VegaAdapter } from '../src/infrastructure/commerce/vega/VegaAdapter.js';

let checkoutService: CheckoutService;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    if (!checkoutService) {
      const orderRepo = new OrderRepository();
      const productRepo = new ProductRepository();
      const paymentRepo = new PaymentRepository();
      const webhookEventRepo = new WebhookEventRepository();
      const vegaAdapter = new VegaAdapter();
      checkoutService = new CheckoutService(orderRepo, productRepo, paymentRepo, webhookEventRepo, vegaAdapter);
    }

    const { productId, items, customerId } = req.body;

    let cartItems = [];
    if (productId) {
      cartItems = [{ productId, quantity: 1 }];
    } else if (items && Array.isArray(items)) {
      cartItems = items;
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Nenhum produto informado' });
    }

    const { checkoutUrl } = await checkoutService.processCheckout(cartItems, customerId);

    return res.status(200).json({ checkout_url: checkoutUrl });

  } catch (error: any) {
    console.error("Erro no checkout:", error);
    
    // Tratamento de erros específicos pode ir aqui, mapeando para 400 ou 500
    const statusCode = error.statusCode || (error.name === 'VegaCommunicationError' ? 502 : 500);
    
    return res.status(statusCode).json({ error: error.message, details: error.details || error.data || 'Sem detalhes' });
  }
}
