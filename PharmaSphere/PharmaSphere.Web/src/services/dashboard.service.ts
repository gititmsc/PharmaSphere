import httpClient from './http.service';

export interface DashboardOrderItem {
  orderId: number;
  orderNo: string;
  party: string | null;
  brandName: string | null;
  qty: number | null;
  currentStatus: string;
  createdDate: string;
  updatedDate: string | null;
}

export interface DashboardStatusCount {
  status: string;
  count: number;
  color: string;
}

export interface AdminDashboard {
  totalOrders: number;
  totalActive: number;
  totalDispatched: number;
  totalCancelled: number;
  pipeline: DashboardStatusCount[];
  recentOrders: DashboardOrderItem[];
}

export interface RoleDashboard {
  roleStatus: string;
  pendingCount: number;
  pendingOrders: DashboardOrderItem[];
}

export interface DashboardResponse {
  role: string;
  admin?: AdminDashboard;
  role_data?: RoleDashboard;
}

export interface DashboardPeriodQty {
  month: number;
  year: number;
  dispatchedQty: number;
  activeQty: number;
}

export const DashboardService = {
  async get(): Promise<DashboardResponse> {
    const { data } = await httpClient.get<DashboardResponse>('/dashboard');
    return data;
  },

  async getPeriodQty(month: number, year: number): Promise<DashboardPeriodQty> {
    const { data } = await httpClient.get<DashboardPeriodQty>(
      `/dashboard/period-qty?month=${month}&year=${year}`,
    );
    return data;
  },
};
