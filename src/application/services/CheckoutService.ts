import { OrderRepository } from '../../infrastructure/repositories/OrderRepository.js';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository.js';
import { PaymentRepository } from '../../infrastructure/repositories/PaymentRepository.js';
import { WebhookEventRepository } from '../../infrastructure/repositories/WebhookEventRepository.js';
import type { CommerceProvider } from '../../domain/commerce/CommerceProvider.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../domain/models/enums.js';
import type { Order, OrderItem, Product } from '../../domain/models/types.js';

export class CheckoutService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;
  private paymentRepo: PaymentRepository;
  private webhookEventRepo: WebhookEventRepository;
  private commerceProvider: CommerceProvider;

  constructor(
    orderRepo: OrderRepository,
    productRepo: ProductRepository,
    paymentRepo: PaymentRepository,
    webhookEventRepo: WebhookEventRepository,
    commerceProvider: CommerceProvider
  ) {
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
    this.paymentRepo = paymentRepo;
    this.webhookEventRepo = webhookEventRepo;
    this.commerceProvider = commerceProvider;
  }

  async processCheckout(
    items: { productId: string; quantity: number }[],
    customerId?: string
  ): Promise<{ checkoutUrl: string }> {
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
      // TODO: Validar stock (product.stock >= item.quantity) se aplicável ao negócio atual

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

    // 2. Criação do Pedido Base
    let order = await this.orderRepo.create({
      customer_id: customerId,
      total_amount: totalAmount,
      subtotal: totalAmount,
      payment_method: PaymentMethod.CREDIT_CARD, // Preenchimento padrão para satisfazer o constraint
      status: OrderStatus.PENDING,
      items: orderItems // Depende de como a estrutura do banco armazena. Assumindo jsonb ou inserção separada no repo real
    });

    // 3. Gerar external code e atualizar
    const externalCode = `ORDER-${order.id.slice(0, 8).toUpperCase()}`;
    order = await this.orderRepo.update(order.id, { external_code: externalCode });

    // 4. Criar Payment Record
    let payment = await this.paymentRepo.create({
      order_id: order.id,
      amount: totalAmount,
      status: PaymentStatus.PENDING,
      payment_method: PaymentMethod.CREDIT_CARD, // Será atualizado via webhook se for diferente
      gateway: 'vega'
    });

    // 5. Chamar a Vega (Provider)
    const { checkoutUrl, transactionToken } = await this.commerceProvider.createCheckout(order, products);

    // 6. Atualizar Pedido e Pagamento com os dados da Vega
    await this.orderRepo.update(order.id, { transaction_token: transactionToken });
    
    if (transactionToken) {
      await this.paymentRepo.update(payment.id, { transaction_id: transactionToken });
    }

    return { checkoutUrl };
  }

  async processWebhook(payload: any, signature?: string): Promise<void> {
    // 1. Registra evento raw para auditoria
    await this.webhookEventRepo.create({
      provider: 'vega',
      payload: payload,
      status: 'received'
    });

    try {
      // 2. Valida e normaliza pelo Provider
      const result = await this.commerceProvider.handleWebhook(payload, signature);

      // 3. Encontrar pedido relacionado
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

      // 4. Encontrar pagamento
      const payment = await this.paymentRepo.findByOrderId(order.id);
      if (!payment) {
        throw new Error(`Pagamento não encontrado para o pedido ${order.id}`);
      }

      // 5. Idempotência: Se o status já for o mesmo, não faz nada (apenas atualiza o evento para processed)
      if (payment.status === result.status) {
        // Nada a fazer, já processado
        return;
      }

      // 6. Atualiza Status do Pagamento
      await this.paymentRepo.update(payment.id, {
        status: result.status as PaymentStatus,
        webhook_payload: result.rawEvent // Ou mesclar com existentes
      });

      // 7. Atualiza Status do Pedido (mapeamento simples)
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
      // TODO: No futuro atualizar o status do evento de webhook para 'failed' no banco
      console.error('Erro ao processar webhook no serviço:', error);
      throw error;
    }
  }
}
