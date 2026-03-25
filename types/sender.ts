export interface Sender {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CreateSenderRequest {
  name: string;
  isActive?: boolean;
}

export interface UpdateSenderRequest {
  name?: string;
  isActive?: boolean;
}
