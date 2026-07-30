export interface ReferralCodeStat {
  referralCode: string;
  ownerName: string | null;
  ownerMobile: string | null;
  ownerRole: "PARTNER" | "SERVICE_PROVIDER" | null;
  clicks: number;
  installs: number;
  registrations: number;
}

export interface ReferralLinkStats {
  totalClicks: number;
  totalInstalls: number;
  totalRegistrations: number;
  byCode: ReferralCodeStat[];
}
