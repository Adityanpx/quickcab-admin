import type { UserStatus } from "./api";
import type { KycRecord as BaseKycRecord } from "./partner";

export type ServiceProviderCategory =
  | "DRIVER"
  | "PUNCTURE_REPAIR"
  | "MECHANIC"
  | "TOWING"
  | "FUEL_PUMP"
  | "RESTAURANT_HOTEL"
  | "HOSPITAL";

export interface ProviderProfile {
  category: ServiceProviderCategory | null;
  businessName: string | null;
  rating: number;
  totalRatings: number;
  city: string | null;
  state: string | null;
  email: string | null;
  isOnline: boolean;
  // Detail-only — GET /admin/providers/:id returns the full profile row,
  // the list endpoint selects only the fields above.
  subServices?: string[];
  area?: string | null;
  fullAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  serviceRadius?: number | null;
  operatingHours?: unknown;
  photos?: string[];
}

// Same shape as the partner KYC record plus the SP-only business document
// (address proof). Extending keeps the two from drifting apart.
export interface ProviderKycRecord extends BaseKycRecord {
  businessDocUrl: string | null;
  businessDocStatus?: "PENDING" | "APPROVED" | "REJECTED";
  businessDocRejectReason?: string | null;
}

export interface Provider {
  id: string;
  displayId?: string;
  name: string;
  mobile: string;
  status: UserStatus;
  walletBalance: number;
  referralCode: string;
  createdAt: string;
  providerProfile: ProviderProfile | null;
  kycRecord: ProviderKycRecord | null;
  subscription: {
    id?: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    endDate: string;
    plan: { name: string };
  } | null;
  // Detail-only — the list endpoint does not select these.
  email?: string | null;
  lastLoginAt?: string | null;
  _count?: {
    serviceRequestsReceived: number;
    ratingsGiven: number;
    ratingsReceived: number;
  };
}

export interface ProviderListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  category?: ServiceProviderCategory;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Row of GET /admin/providers/:id/service-requests
export interface ProviderServiceRequest {
  id: string;
  category: ServiceProviderCategory;
  serviceType: string;
  description: string | null;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "DECLINED"
    | "CANCELLED";
  declineReason: string | null;
  respondedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  driver: { id: string; name: string; mobile: string } | null;
  provider: { id: string; name: string; mobile: string } | null;
}

export const CATEGORY_LABELS: Record<ServiceProviderCategory, string> = {
  DRIVER: "Driver",
  PUNCTURE_REPAIR: "Puncture Repair",
  MECHANIC: "Mechanic",
  TOWING: "Towing",
  FUEL_PUMP: "Fuel Pump",
  RESTAURANT_HOTEL: "Restaurant / Hotel",
  HOSPITAL: "Hospital",
};
