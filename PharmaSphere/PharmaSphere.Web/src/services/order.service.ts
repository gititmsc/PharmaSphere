import httpClient from './http.service';
import type {
  OrderListItem,
  OrderDetail,
  PagedResult,
  OrderListQuery,
  OrderFormValues,
} from '@/types/order.types';

function buildParams(query: OrderListQuery): string {
  const p = new URLSearchParams();
  if (query.search)    p.set('search',   query.search);
  if (query.status)    p.set('status',   query.status);
  if (query.dateFrom)  p.set('dateFrom', query.dateFrom);
  if (query.dateTo)    p.set('dateTo',   query.dateTo);
  if (query.sortBy)    p.set('sortBy',   query.sortBy);
  if (query.sortDir)   p.set('sortDir',  query.sortDir);
  if (query.page)      p.set('page',     String(query.page));
  if (query.pageSize)  p.set('pageSize', String(query.pageSize));
  return p.toString();
}

function toRequest(v: OrderFormValues) {
  const n = (s: string) => (s.trim() === '' ? null : s.trim());
  const d = (s: string) => (s === '' ? null : s);
  return {
    orderNo:                         v.orderNo.trim(),
    orderDate:                       v.orderDate,
    party:                           n(v.party),
    brandName:                       n(v.brandName),
    composition:                     n(v.composition),
    qty:                             v.qty === '' ? null : Number(v.qty),
    shelfLifeMonths:                 n(v.shelfLifeMonths),
    mrp:                             v.mrp === '' ? null : Number(v.mrp),
    rate:                            v.rate === '' ? null : Number(v.rate),
    amount:                          v.amount === '' ? null : Number(v.amount),
    paymentTerms:                    n(v.paymentTerms),
    make:                            n(v.make),
    adminRemarks:                    n(v.adminRemarks),
    vial:                            n(v.vial),
    sealColour:                      n(v.sealColour),
    wfi:                             n(v.wfi),
    label:                           n(v.label),
    monoBox:                         n(v.monoBox),
    tray:                            n(v.tray),
    leaflet:                         n(v.leaflet),
    syringeAndNeedle:                n(v.syringeAndNeedle),
    shrink:                          n(v.shrink),
    shipper:                         n(v.shipper),
    deliverySchedule:                d(v.deliverySchedule),
    otherRemarks:                    n(v.otherRemarks),
    pisApprovalDate:                 d(v.pisApprovalDate),
    sanoletPartyArtworkApprovalDate: d(v.sanoletPartyArtworkApprovalDate),
    qaRemarks:                       n(v.qaRemarks),
    monoBoxSupplyVendorApprovalDate: d(v.monoBoxSupplyVendorApprovalDate),
    labelSupplyVendorApprovalDate:   d(v.labelSupplyVendorApprovalDate),
    insertSupplyVendorApprovalDate:  d(v.insertSupplyVendorApprovalDate),
    traySupplyVendorApprovalDate:    d(v.traySupplyVendorApprovalDate),
    shipperSupplyVendorApprovalDate: d(v.shipperSupplyVendorApprovalDate),
    productionMonoBox:               n(v.productionMonoBox),
    productionLabel:                 n(v.productionLabel),
    productionInsert:                n(v.productionInsert),
    productionTray:                  n(v.productionTray),
    productionShipper:               n(v.productionShipper),
    fillingPlan:                     d(v.fillingPlan),
    packingPlan:                     d(v.packingPlan),
    sterility14DaysDate:             d(v.sterility14DaysDate),
    dispatchDate:                    d(v.dispatchDate),
  };
}

export const OrderService = {
  async getSealColors(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/orders/seal-colors');
    return data;
  },

  async getOrders(query: OrderListQuery): Promise<PagedResult<OrderListItem>> {
    const { data } = await httpClient.get<PagedResult<OrderListItem>>(
      `/orders?${buildParams(query)}`,
    );
    return data;
  },

  async getOrderById(id: number): Promise<OrderDetail> {
    const { data } = await httpClient.get<OrderDetail>(`/orders/${id}`);
    return data;
  },

  async getLatestByBrand(brandName: string): Promise<OrderDetail | null> {
    try {
      const { data } = await httpClient.get<OrderDetail>(
        `/orders/latest-by-brand?brandName=${encodeURIComponent(brandName)}`,
      );
      return data;
    } catch {
      return null;
    }
  },

  async createOrder(values: OrderFormValues): Promise<OrderListItem> {
    const { data } = await httpClient.post<OrderListItem>('/orders', toRequest(values));
    return data;
  },

  async updateOrder(id: number, values: OrderFormValues): Promise<OrderListItem> {
    const { data } = await httpClient.put<OrderListItem>(`/orders/${id}`, toRequest(values));
    return data;
  },

  async deleteOrder(id: number): Promise<void> {
    await httpClient.delete(`/orders/${id}`);
  },

  async restoreOrder(id: number): Promise<void> {
    await httpClient.post(`/orders/${id}/restore`);
  },

  async changeStatus(id: number, newStatus: string, remarks?: string): Promise<void> {
    await httpClient.post(`/orders/${id}/status`, { newStatus, remarks });
  },

};
