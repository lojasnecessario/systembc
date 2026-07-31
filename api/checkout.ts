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
    
    const statusCode = error.statusCode || (error.name === 'VegaCommunicationError' ? 502 : 500);

    let errorMessage = error.message || 'Erro interno ao processar checkout';
    if (error.details) {
      if (error.details.message) {
        errorMessage = `Vega: ${error.details.message}`;
      } else if (error.details.errors && typeof error.details.errors === 'object') {
        const errorKeys = Object.keys(error.details.errors);
        const firstErrorKey = errorKeys[0];
        const firstErrorMsg = error.details.errors[firstErrorKey][0];
        errorMessage = `Vega (${firstErrorKey}): ${firstErrorMsg}`;
      }
    } else if (error.statusCode === 422) {
      errorMessage = 'Vega: 422 - Verifique se os dados e o domínio estão aprovados.';
    }

    return res.status(statusCode).json({ error: errorMessage, details: error.details || error.data || 'Sem detalhes' });
  }
}
