export interface SimCard {
  id: string;
  simSerial: string;
  phoneNumber: string;
  telco: string;
  status: 'INSTOCK' | 'ASSIGNED' | 'SUSPENDED' | 'EXPIRED' | 'DISPOSED';
  packageName: string;
  monthlyFee: number;
  expiryDate?: string;
  currentDeviceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSimCardRequest {
  simSerial: string;
  phoneNumber: string;
  telco: string;
  packageName?: string;
  monthlyFee: number;
  expiryDate?: string;
  notes?: string;
}

export interface SamCard {
  id: string;
  samSerial: string;
  samType: string;
  status: 'INSTOCK' | 'ASSIGNED' | 'DISPOSED';
  currentDeviceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSamCardRequest {
  samSerial: string;
  samType?: string;
  notes?: string;
}
