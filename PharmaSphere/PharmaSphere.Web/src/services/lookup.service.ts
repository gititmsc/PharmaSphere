import httpClient from './http.service';
import type { ProductMasterDetail } from '@/types/productMaster.types';

export const LookupService = {
  async getParties(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/lookups/parties');
    return data;
  },

  async getBrandNames(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/lookups/brand-names');
    return data;
  },

  async getProductMasterBrands(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/lookups/product-master-brands');
    return data;
  },

  async getProductMasterByBrand(brandName: string): Promise<ProductMasterDetail | null> {
    try {
      const { data } = await httpClient.get<ProductMasterDetail>(
        `/lookups/product-master/${encodeURIComponent(brandName)}`,
      );
      return data;
    } catch {
      return null;
    }
  },
};
