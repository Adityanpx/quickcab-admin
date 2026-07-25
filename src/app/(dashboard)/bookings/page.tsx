"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookings } from "@/lib/hooks/useBookings";
import { bookingsApi } from "@/lib/api/bookings";
import { BookingFilters } from "@/components/bookings/BookingFilters";
import { BookingTable } from "@/components/bookings/BookingTable";
import { CancelBookingModal } from "@/components/bookings/CancelBookingModal";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Booking } from "@/types/booking";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

function BookingsPageContent() {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── URL-driven filter state (survives back-navigation) ───────────────────
  const page        = Number(searchParams.get("page") ?? "1");
  const search      = searchParams.get("search") ?? "";
  const status      = searchParams.get("status") ?? "";
  const vehicleType = searchParams.get("vehicleType") ?? "";
  const dateFrom    = searchParams.get("dateFrom") ?? "";
  const dateTo      = searchParams.get("dateTo") ?? "";

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.replace(`?${params.toString()}`);
  }, [router]);

  // ── UI-only state (correctly local) ──────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const { data, isLoading } = useBookings({
    page,
    limit: 15,
    status: (status as Booking["status"]) || undefined,
    vehicleType: vehicleType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const bookings = data?.items ?? [];
  const pagination = data?.pagination;

  // Stats from current page data
  const stats = {
    total: pagination?.total ?? 0,
    open: bookings.filter((b) => b.status === "OPEN").length,
    booked: bookings.filter((b) => b.status === "BOOKED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  const handleSearch = useCallback((v: string) => {
    if (v === (searchParamsRef.current.get("search") ?? "")) return;
    updateParams({ search: v, page: "1" });
  }, [updateParams]);

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await bookingsApi.cancel(cancelTarget.id, reason);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled");
      setCancelTarget(null);
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // The server hard-caps `limit` at 100 per request, so a single call
      // can never return more than 100 rows. Paginate and stitch together.
      const baseFilters = {
        search: search || undefined,
        status: (status as Booking["status"]) || undefined,
        vehicleType: vehicleType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };

      const PAGE_SIZE = 100;
      const SAFETY_MAX_PAGES = 200; // 20,000-row ceiling, avoids a runaway loop

      const first = await bookingsApi.getAll({ ...baseFilters, page: 1, limit: PAGE_SIZE });
      let allItems = [...first.items];
      const total = first.pagination?.total ?? allItems.length;
      const totalPages = Math.min(first.pagination?.totalPages ?? 1, SAFETY_MAX_PAGES);

      for (let p = 2; p <= totalPages; p++) {
        const next = await bookingsApi.getAll({ ...baseFilters, page: p, limit: PAGE_SIZE });
        allItems = allItems.concat(next.items);
      }

      const header = [
        "ID", "Pickup", "Drop", "Date", "Time",
        "Vehicle Type", "Vehicle Name", "Trip Type", "Fuel", "Carrier",
        "Posted Fare", "Status",
        "Partner A", "Partner A Mobile",
        "Partner B", "Partner B Mobile",
      ];
      const rows = allItems.map((b) => [
        b.id,
        b.pickupCity,
        b.dropCity,
        b.date,
        b.time,
        b.vehicleType,
        b.vehicleName ?? "",
        b.tripType ?? "",
        b.fuelType ?? "",
        b.hasCarrier ? "Yes" : "No",
        b.postedAmount,
        b.status,
        b.postedBy?.name ?? "",
        b.postedBy?.mobile ?? "",
        b.acceptedBy?.name ?? "",
        b.acceptedBy?.mobile ?? "",
      ]);
      const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickcab-bookings-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      if (allItems.length < total) {
        toast.error(`Exported ${allItems.length} of ${total} — hit the safety page cap. Narrow your filters and export again for the rest.`);
      } else {
        toast.success(`CSV exported — ${allItems.length} booking${allItems.length === 1 ? "" : "s"}`);
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Bookings"
          subtitle="All B2B lead bookings across the platform"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          index={0}
          label="Total Bookings"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          icon={<BookOpen size={16} />}
          accentColor="purple"
        />
        <StatCard
          index={1}
          label="Open (on page)"
          value={stats.open}
          icon={<Clock size={16} />}
          accentColor="orange"
        />
        <StatCard
          index={2}
          label="Booked (on page)"
          value={stats.booked}
          icon={<CheckCircle size={16} />}
          accentColor="green"
        />
        <StatCard
          index={3}
          label="Cancelled (on page)"
          value={stats.cancelled}
          icon={<XCircle size={16} />}
          accentColor="red"
        />
      </motion.div>

      {/* Filters */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <BookingFilters
          search={search}
          onSearchChange={handleSearch}
          status={status}
          onStatusChange={(v) => updateParams({ status: v, page: "1" })}
          vehicleType={vehicleType}
          onVehicleTypeChange={(v) => updateParams({ vehicleType: v, page: "1" })}
          dateFrom={dateFrom}
          onDateFromChange={(v) => updateParams({ dateFrom: v, page: "1" })}
          dateTo={dateTo}
          onDateToChange={(v) => updateParams({ dateTo: v, page: "1" })}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </motion.div>

      {/* Table */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <BookingTable
          bookings={bookings}
          isLoading={isLoading}
          page={page}
          totalPages={pagination?.totalPages ?? 1}
          total={pagination?.total ?? 0}
          limit={15}
          onPageChange={(n) => updateParams({ page: String(n) })}
          onCancel={setCancelTarget}
        />
      </motion.div>

      {/* Cancel Modal */}
      <CancelBookingModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        booking={cancelTarget}
        loading={cancelling}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsPageContent />
    </Suspense>
  );
}
