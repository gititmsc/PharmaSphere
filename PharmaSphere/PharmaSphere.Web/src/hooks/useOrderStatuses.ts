import { useState, useEffect } from 'react';
import { OrderStatusService } from '@/services/order-status.service';
import type { OrderStatusConfig } from '@/types/order.types';

// Module-level cache — fetched once per browser session
let _cache: OrderStatusConfig[] | null = null;
let _promise: Promise<OrderStatusConfig[]> | null = null;

export function useOrderStatuses() {
  const [statuses, setStatuses] = useState<OrderStatusConfig[]>(_cache ?? []);
  const [loading, setLoading]   = useState(!_cache);

  useEffect(() => {
    if (_cache) return;

    if (!_promise) {
      _promise = OrderStatusService.getAll();
    }

    _promise
      .then(data => {
        _cache = data;
        setStatuses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { statuses, loading };
}
