export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REFUSED = 'refused',
  EXPIRED = 'expired',
  CHARGEBACK = 'chargeback',
  REFUNDED = 'refunded',
  IN_PROCESS = 'in_process',
  DISPUTE = 'dispute',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
  BOLETO = 'boleto',
}
