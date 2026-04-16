import type { UserStatus, KycStatus } from "./api";

export type PartnerSubType = "VEHICLE_OWNER" | "VENDOR";

export interface PartnerProfile {
  subType: PartnerSubType;
  areasOfInterest: string[];
  rating: number;
  totalRatings: number;
}

export interface KycRecord {
  id: string;
  status: KycStatus;
  aadhaarFront: string | null;
  aadhaarBack: string | null;
  aadhaarNumber: string | null;
  drivingLicenseUrl: string | null;
  selfieUrl: string | null;
  adminNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface Partner {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  status: UserStatus;
  walletBalance: number;
  referralCode: string;
  lastLoginAt: string | null;
  createdAt: string;
  partnerProfile: PartnerProfile | null;
  kycRecord: KycRecord | null;
  subscription: {
    id: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    endDate: string;
    plan: { name: string };
  } | null;
  _count?: {
    postedBookings: number;
    acceptedBookings: number;
  };
}

export interface PartnerListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  subType?: PartnerSubType;
  city?: string;
}

export interface SuspendPartnerPayload {
  reason: string;
  isPermanent: boolean;
  endDate?: string;
}

export interface RoleUpgradeRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
  driver: {
    id: string;
    name: string;
    mobile: string;
  };
}
