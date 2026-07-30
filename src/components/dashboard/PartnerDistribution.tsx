"use client";

import { DonutChart } from "@/components/charts/DonutChart";
import type { DashboardStats } from "@/lib/api/dashboard";

interface PartnerDistributionProps {
  stats: DashboardStats;
}

export function PartnerDistribution({ stats }: PartnerDistributionProps) {
  const owners = stats.partners.vehicleOwners;
  const vendors = stats.partners.vendors;
  const providers = stats.providers.total;
  // Some partner accounts can exist without a PartnerProfile row yet (registration
  // dropped off mid-flow, or a data issue) — owners+vendors won't always equal
  // partners.total. Reconcile so the donut total always matches the stat card.
  const unclassifiedPartners = Math.max(0, stats.partners.total - owners - vendors);
  const total = owners + vendors + unclassifiedPartners + providers;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const data = [
    { name: "Vehicle Owner", value: pct(owners), count: owners, color: "#5E5CE6" },
    { name: "Vendor", value: pct(vendors), count: vendors, color: "#312E81" },
    { name: "Service Provider", value: pct(providers), count: providers, color: "#16A34A" },
    ...(unclassifiedPartners > 0
      ? [{ name: "Unclassified Partner", value: pct(unclassifiedPartners), count: unclassifiedPartners, color: "#9CA3AF" }]
      : []),
  ];

  return (
    <div className="card h-full">
      <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text mb-4">
        User Distribution
      </h3>

      <DonutChart
        data={data}
        centerLabel={total.toLocaleString("en-IN")}
        centerSub="Users"
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
                ({item.count.toLocaleString("en-IN")})
              </span>
            </div>
          </div>
        ))}

        {/* Suspended / Blocked mini row — combined partners + providers */}
        <div className="pt-2 mt-2 border-t border-light-border dark:border-dark-border space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-light-text-3 dark:text-dark-text-3">Suspended</span>
            <span className="font-medium text-brand-orange">
              {stats.partners.suspended + stats.providers.suspended}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-light-text-3 dark:text-dark-text-3">Blocked</span>
            <span className="font-medium text-brand-red">
              {stats.partners.blocked + stats.providers.blocked}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
