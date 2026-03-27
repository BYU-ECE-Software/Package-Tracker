export interface Carrier {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export interface CreateCarrierRequest {
  name: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCarrierRequest {
  name?: string;
  isActive?: boolean;
  order?: number;
}