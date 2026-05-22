import httpClient from './http.service';

export const LookupService = {
  async getParties(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/lookups/parties');
    return data;
  },

  async getBrandNames(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/lookups/brand-names');
    return data;
  },
};
