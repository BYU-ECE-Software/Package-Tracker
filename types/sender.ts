export interface Sender {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export interface CreateSenderRequest {
  name: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateSenderRequest {
  name?: string;
  isActive?: boolean;
  order?: number;
}
