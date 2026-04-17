"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";
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

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function BookingsPage() {
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    setSearch(v);
    setPage(1);
  }, []);

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
      const allData = await bookingsApi.getAll({
        status: (status as Booking["status"]) || undefined,
        vehicleType: vehicleType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: 1000,
      });
      const header = [
        "ID", "Pickup", "Drop", "Date", "Time",
        "Vehicle Type", "Vehicle Name", "Trip Type", "Fuel", "Carrier",
        "Posted Fare", "Status",
        "Partner A", "Partner A Mobile",
        "Partner B", "Partner B Mobile",
      ];
      const rows = allData.items.map((b) => [
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
      toast.success("CSV exported");
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
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          vehicleType={vehicleType}
          onVehicleTypeChange={(v) => { setVehicleType(v); setPage(1); }}
          dateFrom={dateFrom}
          onDateFromChange={(v) => { setDateFrom(v); setPage(1); }}
          dateTo={dateTo}
          onDateToChange={(v) => { setDateTo(v); setPage(1); }}
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
          onPageChange={setPage}
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
