"use client";

import { Download } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";

interface PartnerFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  subType: string;
  onSubTypeChange: (v: string) => void;
  onExport: () => void;
  isExporting?: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "KYC_PENDING", label: "KYC Pending" },
  { value: "KYC_IN_PROGRESS", label: "KYC In Review" },
  { value: "KYC_REJECTED", label: "KYC Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "PROFILE_COMPLETE", label: "Profile Complete" },
];

const SUBTYPE_OPTIONS = [
  { value: "VEHICLE_OWNER", label: "Vehicle Owner" },
  { value: "VENDOR", label: "Vendor" },
];

export function PartnerFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  subType,
  onSubTypeChange,
  onExport,
  isExporting,
}: PartnerFiltersProps) {
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

      {/* Sub-type filter */}
      <FilterSelect
        value={subType}
        onChange={onSubTypeChange}
        options={SUBTYPE_OPTIONS}
        placeholder="All Types"
        className="sm:w-40"
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
