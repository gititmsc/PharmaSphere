// ── Statuses ──────────────────────────────────────────────────────────────────

export const ORDER_STATUSES = [
  'Created',
  'Artwork Pending',
  'QA Pending',
  'Production Pending',
  'Dispatched',
  'Cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  'Created':            ['Artwork Pending', 'Cancelled'],
  'Artwork Pending':    ['QA Pending', 'Cancelled'],
  'QA Pending':         ['Production Pending', 'Cancelled'],
  'Production Pending': ['Dispatched', 'Cancelled'],
  'Dispatched':         [],
  'Cancelled':          [],
};

export const STATUS_COLOR: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  'Created':            'default',
  'Artwork Pending':    'info',
  'QA Pending':         'warning',
  'Production Pending': 'secondary',
  'Dispatched':         'success',
  'Cancelled':          'error',
};

// ── ID encoding (obfuscation) ─────────────────────────────────────────────────

export function encodeOrderId(id: number): string {
  return btoa(`order_${id}_ps`);
}

export function decodeOrderId(encoded: string): number | null {
  try {
    const s = atob(encoded);
    const m = s.match(/^order_(\d+)_ps$/);
    return m ? parseInt(m[1], 10) : null;
  } catch {
    return null;
  }
}

// ── API Types ─────────────────────────────────────────────────────────────────

export interface OrderListItem {
  orderId: number;
  orderNo: string;
  orderDate: string;
  party: string | null;
  brandName: string | null;
  qty: number | null;
  rate: number | null;
  amount: number | null;
  currentStatus: string;
  createdBy: string | null;
  createdDate: string;
  updatedDate: string | null;
  isActive: boolean;
}

export interface OrderDetail {
  orderId: number;
  // Admin
  orderNo: string;
  orderDate: string;
  party: string | null;
  brandName: string | null;
  composition: string | null;
  qty: number | null;
  shelfLifeMonths: number | null;
  mrp: number | null;
  rate: number | null;
  amount: number | null;
  paymentTerms: string | null;
  make: string | null;
  adminRemarks: string | null;
  vial: string | null;
  sealColour: string | null;
  wfi: string | null;
  label: string | null;
  monoBox: string | null;
  tray: string | null;
  leaflet: string | null;
  syringeAndNeedle: string | null;
  shrink: string | null;
  shipper: string | null;
  deliverySchedule: string | null;
  otherRemarks: string | null;
  // QA
  pisApprovalDate: string | null;
  sanoletPartyArtworkApprovalDate: string | null;
  qaRemarks: string | null;
  monoBoxSupplyVendorApprovalDate: string | null;
  labelSupplyVendorApprovalDate: string | null;
  insertSupplyVendorApprovalDate: string | null;
  traySupplyVendorApprovalDate: string | null;
  shipperSupplyVendorApprovalDate: string | null;
  // Production
  productionMonoBox: string | null;
  productionLabel: string | null;
  productionInsert: string | null;
  productionTray: string | null;
  productionShipper: string | null;
  fillingPlan: string | null;
  packingPlan: string | null;
  sterility14DaysDate: string | null;
  dispatchDate: string | null;
  // Status & audit
  currentStatus: string;
  createdBy: string | null;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
  isActive: boolean;
  statusHistory: OrderStatusHistoryItem[];
  auditLogs: OrderAuditLogItem[];
}

export interface OrderStatusHistoryItem {
  historyId: number;
  fromStatus: string | null;
  toStatus: string;
  remarks: string | null;
  changedBy: string | null;
  changedDate: string;
}

export interface OrderAuditLogItem {
  auditLogId: number;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string | null;
  changedDate: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface OrderListQuery {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export type SortField = 'orderNo' | 'orderDate' | 'party' | 'brandName' | 'qty' | 'status' | 'createdDate' | 'updatedDate';
export type SortDir   = 'asc' | 'desc';

// ── Form Types ────────────────────────────────────────────────────────────────

export interface OrderFormValues {
  // Admin
  orderNo: string;
  orderDate: string;
  party: string;
  brandName: string;
  composition: string;
  qty: string;
  shelfLifeMonths: string;
  mrp: string;
  rate: string;
  amount: string;
  paymentTerms: string;
  make: string;
  adminRemarks: string;
  vial: string;
  sealColour: string;
  wfi: string;
  label: string;
  monoBox: string;
  tray: string;
  leaflet: string;
  syringeAndNeedle: string;
  shrink: string;
  shipper: string;
  deliverySchedule: string;
  otherRemarks: string;
  // QA
  pisApprovalDate: string;
  sanoletPartyArtworkApprovalDate: string;
  qaRemarks: string;
  monoBoxSupplyVendorApprovalDate: string;
  labelSupplyVendorApprovalDate: string;
  insertSupplyVendorApprovalDate: string;
  traySupplyVendorApprovalDate: string;
  shipperSupplyVendorApprovalDate: string;
  // Production
  productionMonoBox: string;
  productionLabel: string;
  productionInsert: string;
  productionTray: string;
  productionShipper: string;
  fillingPlan: string;
  packingPlan: string;
  sterility14DaysDate: string;
  dispatchDate: string;
}
