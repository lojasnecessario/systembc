export const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELED: 'canceled',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REFUSED: 'refused',
  EXPIRED: 'expired',
  CHARGEBACK: 'chargeback',
  REFUNDED: 'refunded',
  IN_PROCESS: 'in_process',
  DISPUTE: 'dispute',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CREDIT_CARD: 'credit_card',
  PIX: 'pix',
  BOLETO: 'boleto',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
