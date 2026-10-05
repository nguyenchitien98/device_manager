export interface RentalFeePolicy {
  id: number;
  code: string;
  name: string;
  minMonthlyVolume: number;
  monthlyRentalFee: number;
  penaltyFee: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyFeeCharge {
  id: number;
  period: string;
  merchantId: number;
  terminalId?: number;
  actualVolume: number;
  feeAmount: number;
  status: 'PENDING' | 'CHARGED' | 'FAILED' | 'WAIVED';
  t24ReferenceNo?: string;
  chargedAt?: string;
  createdAt?: string;
}
