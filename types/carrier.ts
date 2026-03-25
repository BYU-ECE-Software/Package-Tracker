export interface Carrier {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CreateCarrierRequest {
  name: string;
  isActive?: boolean;
}

export interface UpdateCarrierRequest {
  name?: string;
  isActive?: boolean;
}
