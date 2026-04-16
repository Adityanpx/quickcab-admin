"use client";

import { DonutChart } from "@/components/charts/DonutChart";
import type { DashboardStats } from "@/lib/api/dashboard";

interface PartnerDistributionProps {
  stats: DashboardStats;
}

export function PartnerDistribution({ stats }: PartnerDistributionProps) {
  const total = stats.partners.total;
  const owners = stats.partners.vehicleOwners;
  const vendors = stats.partners.vendors;

  const ownerPct = total > 0 ? Math.round((owners / total) * 100) : 0;
  const vendorPct = total > 0 ? Math.round((vendors / total) * 100) : 0;

  const data = [
    { name: "Vehicle Owner", value: ownerPct, color: "#5E5CE6" },
    { name: "Vendor", value: vendorPct, color: "#312E81" },
  ];

  return (
    <div className="card h-full">
      <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text mb-4">
        Partner Distribution
      </h3>

      <DonutChart
        data={data}
        centerLabel={total.toLocaleString("en-IN")}
        centerSub="Partners"
        height={170}
      />

      {/* Legend */}
      <div className="mt-5 space-y-2.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[13px] text-light-text-2 dark:text-dark-text-2">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-light-text dark:text-dark-text">
                {item.value}%
              </span>
              <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                ({item.name === "Vehicle Owner"
                  ? owners.toLocaleString("en-IN")
                  : vendors.toLocaleString("en-IN")}
                )
              </span>
            </div>
          </div>
        ))}

        {/* Suspended / Blocked mini row */}
        <div className="pt-2 mt-2 border-t border-light-border dark:border-dark-border space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-light-text-3 dark:text-dark-text-3">Suspended</span>
            <span className="font-medium text-brand-orange">
              {stats.partners.suspended}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-light-text-3 dark:text-dark-text-3">Blocked</span>
            <span className="font-medium text-brand-red">
              {stats.partners.blocked}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
