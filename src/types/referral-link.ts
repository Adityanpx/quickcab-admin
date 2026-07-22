export interface ReferralCodeStat {
  referralCode: string;
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
