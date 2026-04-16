export type WithdrawalStatus = "PENDING" | "PROCESSED" | "REJECTED";
export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionReason =
  | "LEAD_CONFIRMED"
  | "REFERRAL_EARNING"
  | "WITHDRAWAL"
  | "MANUAL_ADJUST";

export interface WithdrawalRequest {
  id: string;
  amountINR: number;
  status: WithdrawalStatus;
  bankAccount: string;
  ifsc: string;
  accountHolder: string;
  razorpayPayoutId: string | null;
  processedAt: string | null;
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
  totalCoinsInCirculation: number;
  totalWithdrawnINR: number;
  pendingWithdrawalCount: number;
  pendingWithdrawalAmount: number;
}
