export interface InactivityAlert {
  id: string;
  terminalId: string;
  merchantId?: string;
  deviceId?: string;
  daysInactive: number;
  lastTxAt?: string;
  status: 'NEW' | 'NOTIFIED' | 'RECALLED' | 'DISMISSED';
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  createdAt: string;
}
