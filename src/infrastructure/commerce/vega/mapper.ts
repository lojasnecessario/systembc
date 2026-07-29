import type { Order, Product } from '../../../domain/models/types.js';
import { PaymentStatus } from '../../../domain/models/enums.js';
import { toCents } from './utils.js';
import { VEGA_STATUS_MAP } from './constants.js';

export class VegaMapper {
  static toCheckoutPayload(order: Order, products: Product[], appUrl: string): any {
    const vegaProducts = order.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        code: item.product_id,
        name: product ? product.name : `Produto ${item.product_id}`,
        price: toCents(item.unit_price),
        is_digital: false,
        quantity: item.quantity,
        description: product ? product.description : undefined
      };
    });

    return {
      // Adicionado mock de customer para satisfazer a API de Pix que exige dados de cliente
      customer: {
        name: "Cliente Loja",
        email: "cliente@loja.com",
        document: "00000000000",
        phone: "+5511999999999",
        address: {
            street: "Rua Exemplo",
            number: "123",
            complement: "Apto 1",
            district: "Centro",
            city: "São Paulo",
            state: "SP",
            zipcode: "01001000"
        }
      },
      payment: {
        method: "pix", // O endpoint da doc é "Api de Pix", então enviamos pix
        payment_value: toCents(order.total_amount),
        freight_value: 0,
        discount_value: 0,
        external_code: order.external_code || order.id,
        currency: "BRL"
      },
      products: vegaProducts,
      notification_url: `${appUrl}/api/webhooks/vega`,
      src: "systembc"
    };
  }

  static toInternalStatus(vegaStatus: string): PaymentStatus {
    const mapped = VEGA_STATUS_MAP[vegaStatus.toLowerCase()];
    if (!mapped) return PaymentStatus.PENDING;
    return mapped as PaymentStatus;
  }
}
