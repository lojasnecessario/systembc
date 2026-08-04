import { OrderRepository } from '../../infrastructure/repositories/OrderRepository.js';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository.js';
import { PaymentRepository } from '../../infrastructure/repositories/PaymentRepository.js';
import { CustomerRepository } from '../../infrastructure/repositories/CustomerRepository.js';
import type { CommerceProvider } from '../../domain/commerce/CommerceProvider.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../domain/models/enums.js';
import type { Order, OrderItem, Product, Customer } from '../../domain/models/types.js';

export class CheckoutService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;
  private paymentRepo: PaymentRepository;
  private customerRepo: CustomerRepository;
  private commerceProvider: CommerceProvider;

  constructor(
    orderRepo: OrderRepository,
    productRepo: ProductRepository,
    paymentRepo: PaymentRepository,
    customerRepo: CustomerRepository,
    commerceProvider: CommerceProvider
  ) {
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
    this.paymentRepo = paymentRepo;
    this.customerRepo = customerRepo;
    this.commerceProvider = commerceProvider;
  }

  async processCheckout(
    items: { productId: string; quantity: number }[],
    customerData: any
  ): Promise<any> {
    if (!items || items.length === 0) {
      throw new Error('Carrinho vazio');
    }

    const orderItems: OrderItem[] = [];
    const products: Product[] = [];
    let totalAmount = 0;

    // 1. Busca e validação de produtos
    for (const item of items) {
      const product = await this.productRepo.getById(item.productId);
      if (!product) {
        throw new Error(`Produto não encontrado: ${item.productId}`);
      }
      if (!product.is_active) {
        throw new Error(`Produto indisponível: ${product.name}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto: ${product.name}`);
      }

      const currentPrice = (product.promotional_price !== null && product.promotional_price < product.price)
        ? product.promotional_price
        : product.price;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: currentPrice
      });
      
      products.push(product);

      totalAmount += currentPrice * item.quantity;
    }

    // 2. Get or Create Customer
    let customer = await this.customerRepo.getByEmailOrCpf(customerData.email, customerData.cpf);
    if (!customer) {
      customer = await this.customerRepo.create({
        name: customerData.name,
        email: customerData.email,
        cpf: customerData.cpf,
        phone: customerData.phone,
        cep: customerData.cep,
        street: customerData.street,
        number: customerData.number,
        complement: customerData.complement,
        district: customerData.district,
        city: customerData.city,
        state: customerData.state
      });
    } else {
      // Atualiza os dados de endereço se o cliente já existia
      await this.customerRepo.update(customer.id, {
        name: customerData.name,
        phone: customerData.phone,
        cep: customerData.cep,
        street: customerData.street,
        number: customerData.number,
        complement: customerData.complement,
        district: customerData.district,
        city: customerData.city,
        state: customerData.state
      });
      customer = { ...customer, ...customerData };
    }

    // 3. Criação do Pedido Base (Pending)
    let order = await this.orderRepo.create({
      customer_id: customer!.id,
      total_amount: totalAmount,
      subtotal: totalAmount,
      payment_method: PaymentMethod.PIX,
      status: OrderStatus.PENDING,
      items: orderItems
    });

    const externalCode = `ORDER-${order.id.slice(0, 8).toUpperCase()}`;
    await this.orderRepo.update(order.id, { external_code: externalCode });
    order.external_code = externalCode;

    // 4. Criar Payment Record
    let payment = await this.paymentRepo.create({
      order_id: order.id,
      amount: Math.round(totalAmount * 100), // Converte para centavos pois a coluna exige integer
      status: PaymentStatus.PENDING,
      payment_method: PaymentMethod.PIX,
      gateway: 'vega'
    });

    // 5. Chamar a Vega (Provider) com o customer montado
    const vegaResponse = await this.commerceProvider.createCheckout(order, products, customer as Customer);
    
    const pixCopyPaste = vegaResponse.pix_copy_paste;
    let qrCodeUrl = vegaResponse.qr_code_url;
    if (!qrCodeUrl && pixCopyPaste) {
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCopyPaste)}`;
    }

    // 6. Atualizar Pedido e Pagamento com a resposta da Vega
    await this.orderRepo.update(order.id, { 
      transaction_token: vegaResponse.transactionToken,
      pix_copy_paste: pixCopyPaste,
      qr_code_url: qrCodeUrl
    });
    
    // Log apenas para depuração do sistema, não salvar payload no banco
    console.log(`[Vega PIX] Pedido ${externalCode} criado. Resposta:`, JSON.stringify(vegaResponse.rawResponse, null, 2));
    
    if (vegaResponse.transactionToken) {
      await this.paymentRepo.update(payment.id, { transaction_id: vegaResponse.transactionToken });
    }

    return { 
      external_code: externalCode,
      transaction_token: vegaResponse.transactionToken,
      pix_copy_paste: pixCopyPaste,
      qr_code_url: qrCodeUrl,
      payment_status: vegaResponse.payment_status
    };
  }

  async processWebhook(payload: any, signature?: string): Promise<void> {
    console.log('[Webhook Recebido Vega]', JSON.stringify({ 
      transaction_token: payload.transaction_token, 
      status: payload.status 
    }));

    try {
      const result = await this.commerceProvider.handleWebhook(payload, signature);

      let order: Order | null = null;
      if (result.transactionToken) {
        order = await this.orderRepo.findByTransactionToken(result.transactionToken);
      }
      if (!order && result.externalCode) {
        order = await this.orderRepo.findByExternalCode(result.externalCode);
      }

      if (!order) {
        throw new Error(`Pedido não encontrado para token/code do webhook`);
      }

      const payment = await this.paymentRepo.findByOrderId(order.id);
      if (!payment) {
        throw new Error(`Pagamento não encontrado para o pedido ${order.id}`);
      }

      // Idempotência
      if (payment.status === result.status) {
        return;
      }

      await this.paymentRepo.update(payment.id, {
        status: result.status as PaymentStatus
      });

      let newOrderStatus = order.status;
      if (result.status === PaymentStatus.APPROVED) {
        newOrderStatus = OrderStatus.PAID;
      } else if (result.status === PaymentStatus.REFUSED || result.status === PaymentStatus.EXPIRED || result.status === PaymentStatus.CHARGEBACK) {
        newOrderStatus = OrderStatus.CANCELED;
      }

      if (newOrderStatus !== order.status) {
        await this.orderRepo.update(order.id, { status: newOrderStatus });
      }

    } catch (error: any) {
      console.error('Erro ao processar webhook no serviço:', error);
      throw error;
    }
  }
}
