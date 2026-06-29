// ── ID encoding ───────────────────────────────────────────────────────────────

export function encodeProductId(id: number): string {
  return btoa(`pm_${id}_ps`);
}

export function decodeProductId(encoded: string): number | null {
  try {
    const s = atob(encoded);
    const m = s.match(/^pm_(\d+)_ps$/);
    return m ? parseInt(m[1], 10) : null;
  } catch {
    return null;
  }
}

// ── Shared paged result ───────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── API Types ─────────────────────────────────────────────────────────────────

export interface ProductMasterListItem {
  id: number;
  brandName: string;
  genericName: string;
  vial: string;
  sealColor: string;
  monoBox: string;
}

export interface ProductMasterDetail {
  id: number;
  brandName: string;
  genericName: string;
  vial: string;
  sealColor: string;
  wfi: string;
  label: string;
  monoBox: string;
  monthBox: string;
  tray: string;
  leaflet: string;
  syringeNeedle: string;
  shrink: string;
  shipper: string;
  hologram: string;
  createdBy: string | null;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
}

export interface ProductMasterListQuery {
  search?: string;
  brandName?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ProductMasterFormValues {
  brandName: string;
  genericName: string;
  vial: string;
  sealColor: string;
  wfi: string;
  label: string;
  monoBox: string;
  monthBox: string;
  tray: string;
  leaflet: string;
  syringeNeedle: string;
  shrink: string;
  shipper: string;
  hologram: string;
}
