export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
}

export type UserStatus =
  | "ONBOARDING"
  | "PROFILE_COMPLETE"
  | "KYC_IN_PROGRESS"
  | "KYC_PENDING"
  | "KYC_REJECTED"
  | "ACTIVE"
  | "SUSPENDED"
  | "BLOCKED";

export type KycStatus =
  | "NOT_SUBMITTED"
  | "IN_PROGRESS"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";
