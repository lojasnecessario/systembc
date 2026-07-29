import type { Order, Product } from '../../../domain/models/types.js';
import { PaymentStatus } from '../../../domain/models/enums.js';
import type { VegaCheckoutPayload } from './types.js';
import { toCents } from './utils.js';
import { VEGA_STATUS_MAP } from './constants.js';

export class VegaMapper {
  static toCheckoutPayload(order: Order, products: Product[], appUrl: string): VegaCheckoutPayload {
    const vegaProducts = order.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        code: item.product_id,
        title: product ? product.name : `Produto ${item.product_id}`,
        amount: toCents(item.unit_price),
        quantity: item.quantity,
        description: product ? product.description : undefined
      };
    });

    return {
      products: vegaProducts,
      payment: {
        method: "credit_card", // Default, pode ser dinâmico no futuro
        payment_value: toCents(order.total_amount),
        currency: "BRL"
      },
      external_code: order.external_code,
      notification_url: `${appUrl}/api/webhooks/vega`,
      return_url: `${appUrl}/checkout/success`
    };
  }

  static toInternalStatus(vegaStatus: string): PaymentStatus {
    const mapped = VEGA_STATUS_MAP[vegaStatus.toLowerCase()];
    if (!mapped) return PaymentStatus.PENDING;
    return mapped as PaymentStatus;
  }
}
