import { CheckoutService } from '../src/application/services/CheckoutService.js';
import { OrderRepository } from '../src/infrastructure/repositories/OrderRepository.js';
import { ProductRepository } from '../src/infrastructure/repositories/ProductRepository.js';
import { PaymentRepository } from '../src/infrastructure/repositories/PaymentRepository.js';
import { CustomerRepository } from '../src/infrastructure/repositories/CustomerRepository.js';
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
      const customerRepo = new CustomerRepository();
      const vegaAdapter = new VegaAdapter();
      checkoutService = new CheckoutService(orderRepo, productRepo, paymentRepo, customerRepo, vegaAdapter);
    }

    const { productId, items, customer } = req.body;

    let cartItems = [];
    if (productId) {
      cartItems = [{ productId, quantity: 1 }];
    } else if (items && Array.isArray(items)) {
      cartItems = items;
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Nenhum produto informado' });
    }
    
    if (!customer || !customer.name || !customer.cpf) {
      return res.status(400).json({ error: 'Dados do cliente incompletos' });
    }

    const result = await checkoutService.processCheckout(cartItems, customer);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("Erro no checkout:", error);
    
    // Tratamento de erros específicos pode ir aqui, mapeando para 400 ou 500
    const statusCode = error.statusCode || (error.name === 'VegaCommunicationError' ? 502 : 500);
    
    return res.status(statusCode).json({ error: error.message, details: error.details || error.data || 'Sem detalhes' });
  }
}
