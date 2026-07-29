import { OrderStatus, PaymentStatus, PaymentMethod } from './enums.js';

export interface Customer {
  id: string;
  name: string;
  email: string;
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
  status: OrderStatus;
  external_code?: string;
  transaction_token?: string;
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
