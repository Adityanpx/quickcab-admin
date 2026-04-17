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
  status: "NOT_SUBMITTED" | "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED";

  // Personal info
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  email: string | null;
  aadhaarNumber: string | null;

  // Location
  cityId: string | null;
  area: string | null;

  // Documents — URLs
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  drivingLicenceUrl: string | null;
  selfieUrl: string | null;
  businessDocUrl: string | null;

  // Vehicle info (Partner)
  vehicleName: string | null;
  vehicleType: string | null;
  vehicleNumber: string | null;

  // Business info (Provider)
  businessName: string | null;

  // Per-document statuses
  aadhaarFrontStatus: "PENDING" | "APPROVED" | "REJECTED";
  aadhaarBackStatus: "PENDING" | "APPROVED" | "REJECTED";
  drivingLicenceStatus: "PENDING" | "APPROVED" | "REJECTED";
  selfieStatus: "PENDING" | "APPROVED" | "REJECTED";
  businessDocStatus: "PENDING" | "APPROVED" | "REJECTED";

  // Per-document reject reasons
  aadhaarRejectReason: string | null;
  drivingLicenceRejectReason: string | null;
  selfieRejectReason: string | null;
  businessDocRejectReason: string | null;

  // Admin review
  adminNote: string | null;
  reviewedAt: string | null;

  // Timestamps
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  resubmittedAt: string | null;

  // Set by backend after resubmit — which docs are freshly re-uploaded
  resubmittedDocuments?: string[];
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
