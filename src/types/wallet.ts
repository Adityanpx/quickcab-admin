export type WithdrawalStatus = "PENDING" | "PROCESSED" | "REJECTED";
export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionReason =
  | "LEAD_CONFIRMED"
  | "REFERRAL_EARNING"
  | "WITHDRAWAL"
  | "WITHDRAWAL_REJECTED_REFUND"
  | "MANUAL_ADJUST";

export interface WithdrawalRequest {
  id: string;
  amountINR: number;
  amountCoins: number;
  status: WithdrawalStatus;
  bankAccount: string;
  ifsc: string;
  accountHolder: string;
  utr: string | null;
  processedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    mobile: string;
  };
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  reason: TransactionReason;
  referenceId: string | null;
  createdAt: string;
}

export interface ManualAdjustPayload {
  userId: string;
  amount: number;
  type: TransactionType;
  reason: string;
}

export interface WalletStats {
  pendingWithdrawalCount: number;
  pendingWithdrawalAmount: number;
  totalWithdrawnINR: number;
  totalCoinsInCirculation: number;
}

export interface WalletConfig {
  minWithdrawalCoins: number;
  maxWithdrawalCoins: number;
}
