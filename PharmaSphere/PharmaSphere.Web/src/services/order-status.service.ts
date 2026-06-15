import httpClient from './http.service';
import type { OrderStatusConfig } from '@/types/order.types';

export const OrderStatusService = {
  async getAll(): Promise<OrderStatusConfig[]> {
    const { data } = await httpClient.get<OrderStatusConfig[]>('/order-statuses');
    return data;
  },
};
