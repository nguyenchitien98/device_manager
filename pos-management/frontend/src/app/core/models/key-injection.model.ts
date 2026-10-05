export interface KeyInjectionOrder {
  id: string;
  orderNumber: string;
  deviceId: string;
  hsmProfileId: string;
  status: 'PENDING' | 'INJECTING' | 'SUCCESS' | 'FAILED';
  injectedBy?: string;
  approvedBy?: string;
  hsmResponseCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyInjectionOrderRequest {
  deviceId: string;
  hsmProfileId?: string;
  notes?: string;
}
