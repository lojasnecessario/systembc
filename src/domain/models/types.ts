import { OrderStatus, PaymentStatus, PaymentMethod } from './enums.js';

export interface Customer {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  description: string;
  stock: number;
  is_active: boolean;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  customer_id?: string;
  total_amount: number;
  subtotal?: number;
  payment_method?: PaymentMethod;
  status: OrderStatus;
  external_code?: string;
  transaction_token?: string;
  pix_copy_paste?: string;
  qr_code_url?: string;
  payload_enviado?: any;
  payload_recebido?: any;
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  gateway: string;
  transaction_id?: string;
  webhook_payload?: any;
  created_at?: string;
  updated_at?: string;
}
