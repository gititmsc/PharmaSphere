import httpClient from './http.service';
import type {
  PagedResult,
  ProductMasterListItem,
  ProductMasterDetail,
  ProductMasterListQuery,
  ProductMasterFormValues,
} from '@/types/productMaster.types';

export const ProductMasterService = {
  async getProducts(query: ProductMasterListQuery): Promise<PagedResult<ProductMasterListItem>> {
    const params = new URLSearchParams();
    if (query.search)    params.set('search',    query.search);
    if (query.brandName) params.set('brandName', query.brandName);
    if (query.sortBy)    params.set('sortBy',    query.sortBy);
    if (query.sortDir)   params.set('sortDir',   query.sortDir);
    if (query.page)      params.set('page',      String(query.page));
    if (query.pageSize)  params.set('pageSize',  String(query.pageSize));

    const { data } = await httpClient.get<PagedResult<ProductMasterListItem>>(
      `/product-masters?${params.toString()}`,
    );
    return data;
  },

  async getBrandNames(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/product-masters/brand-names');
    return data;
  },

  async getById(id: number): Promise<ProductMasterDetail> {
    const { data } = await httpClient.get<ProductMasterDetail>(`/product-masters/${id}`);
    return data;
  },

  async create(values: ProductMasterFormValues): Promise<ProductMasterListItem> {
    const { data } = await httpClient.post<ProductMasterListItem>('/product-masters', values);
    return data;
  },

  async update(id: number, values: ProductMasterFormValues): Promise<ProductMasterListItem> {
    const { data } = await httpClient.put<ProductMasterListItem>(`/product-masters/${id}`, values);
    return data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/product-masters/${id}`);
  },
};
