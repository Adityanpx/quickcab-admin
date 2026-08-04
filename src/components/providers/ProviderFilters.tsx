"use client";

import { Download } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";

interface ProviderFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  kycStatus: string;
  onKycStatusChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  city: string;
  onCityChange: (v: string) => void;
  cities: { city: string; count: number }[];
  onExport: () => void;
  isExporting?: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE",           label: "Active" },
  { value: "PROFILE_COMPLETE", label: "KYC In Progress" },
  { value: "KYC_PENDING",      label: "KYC Submitted" },
  { value: "KYC_IN_PROGRESS",  label: "KYC In Review" },
  { value: "SUSPENDED",        label: "Suspended" },
  { value: "BLOCKED",          label: "Blocked" },
];

const KYC_STATUS_OPTIONS = [
  { value: "PENDING",  label: "KYC Pending" },
  { value: "APPROVED", label: "KYC Approved" },
  { value: "REJECTED", label: "KYC Rejected" },
];

const CATEGORY_OPTIONS = [
  { value: "DRIVER",           label: "Driver" },
  { value: "PUNCTURE_REPAIR",  label: "Puncture Repair" },
  { value: "MECHANIC",         label: "Mechanic" },
  { value: "TOWING",           label: "Towing" },
  { value: "FUEL_PUMP",        label: "Fuel Pump" },
  { value: "RESTAURANT_HOTEL", label: "Restaurant / Hotel" },
  { value: "HOSPITAL",         label: "Hospital" },
];

export function ProviderFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  kycStatus,
  onKycStatusChange,
  category,
  onCategoryChange,
  city,
  onCityChange,
  cities,
  onExport,
  isExporting,
}: ProviderFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search */}
      <SearchInput
        placeholder="Search by name or mobile..."
        onSearch={onSearchChange}
        defaultValue={search}
        className="sm:w-64"
      />

      {/* Status filter */}
      <FilterSelect
        value={status}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        placeholder="All Statuses"
        className="sm:w-44"
      />
      <FilterSelect
        value={kycStatus}
        onChange={onKycStatusChange}
        options={KYC_STATUS_OPTIONS}
        placeholder="All KYC"
        className="sm:w-40"
      />

      {/* Category filter */}
      <FilterSelect
        value={category}
        onChange={onCategoryChange}
        options={CATEGORY_OPTIONS}
        placeholder="All Categories"
        className="sm:w-44"
      />

      {/* City filter */}
      <FilterSelect
        value={city}
        onChange={onCityChange}
        options={cities.map((c) => ({
          value: c.city,
          label: `${c.city} (${c.count})`,
        }))}
        placeholder="All Cities"
        className="sm:w-44"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export CSV */}
      <Button
        variant="outline"
        size="sm"
        icon={<Download size={14} />}
        onClick={onExport}
        loading={isExporting}
      >
        Export CSV
      </Button>
    </div>
  );
}
