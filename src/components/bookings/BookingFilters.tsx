"use client";

import { Download } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface BookingFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  vehicleType: string;
  onVehicleTypeChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  onExport: () => void;
  isExporting?: boolean;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "BOOKED", label: "Booked" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

const VEHICLE_OPTIONS = [
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "HATCHBACK", label: "Hatchback" },
  { value: "TEMPO_TRAVELLER", label: "Tempo Traveller" },
  { value: "BUS", label: "Bus" },
  { value: "LUXURY", label: "Luxury" },
];

export function BookingFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  vehicleType,
  onVehicleTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onExport,
  isExporting,
}: BookingFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Row 1: Search + Status + Vehicle + Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchInput
          placeholder="Search by city or partner name..."
          onSearch={onSearchChange}
          defaultValue={search}
          className="sm:w-64"
        />
        <FilterSelect
          value={status}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          className="sm:w-40"
        />
        <FilterSelect
          value={vehicleType}
          onChange={onVehicleTypeChange}
          options={VEHICLE_OPTIONS}
          placeholder="All Vehicles"
          className="sm:w-44"
        />
        <div className="flex-1" />
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

      {/* Row 2: Date range */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[13px] text-light-text-2 dark:text-dark-text-2 whitespace-nowrap">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className={cn("input-base py-1.5 text-sm", "sm:w-44")}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[13px] text-light-text-2 dark:text-dark-text-2 whitespace-nowrap">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className={cn("input-base py-1.5 text-sm", "sm:w-44")}
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { onDateFromChange(""); onDateToChange(""); }}
            className="text-[12px] text-brand-purple hover:underline"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
