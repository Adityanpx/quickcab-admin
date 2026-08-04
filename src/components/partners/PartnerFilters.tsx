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
  city,
  onCityChange,
  cities,
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
