import { z } from 'zod';

export const VegaProductSchema = z.object({
  code: z.string(),
  title: z.string(),
  amount: z.number(), // in cents
  quantity: z.number(),
  description: z.string().optional()
});

export const VegaPaymentSchema = z.object({
  method: z.string(),
  payment_value: z.number(), // in cents
  currency: z.string().default('BRL')
});

export const VegaCheckoutPayloadSchema = z.object({
  products: z.array(VegaProductSchema),
  payment: VegaPaymentSchema,
  external_code: z.string().optional(),
  webhook_url: z.string().optional(),
  return_url: z.string().optional()
});

export type VegaCheckoutPayload = z.infer<typeof VegaCheckoutPayloadSchema>;

export const VegaCheckoutResponseSchema = z.object({
  checkout_url: z.string().optional(),
  payment_url: z.string().optional(),
  url: z.string().optional(),
  transaction_token: z.string().optional()
});

export type VegaCheckoutResponse = z.infer<typeof VegaCheckoutResponseSchema>;

export interface VegaWebhookPayload {
  event: string;
  transaction_token: string;
  external_code?: string;
  status: string;
  payment_method?: string;
  [key: string]: any;
}
