"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, XCircle, Wallet } from "lucide-react";
import { useBooking } from "@/lib/hooks/useBookings";
import { bookingsApi } from "@/lib/api/bookings";
import { BookingDetailCard } from "@/components/bookings/BookingDetailCard";
import { CancelBookingModal } from "@/components/bookings/CancelBookingModal";
import { ManualAdjustModal } from "@/components/wallet/ManualAdjustModal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const bookingId = params.id as string;

  const [showCancel, setShowCancel] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data: booking, isLoading, isError } = useBooking(bookingId);

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !booking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-light-text-2 dark:text-dark-text-2">Booking not found</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const handleCancelConfirm = async (reason: string) => {
    setCancelling(true);
    try {
      await bookingsApi.cancel(booking.id, reason);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled");
      setShowCancel(false);
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = booking.status === "OPEN";

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Back + Actions */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-light-text-2 dark:text-dark-text-2 hover:text-light-text dark:hover:text-dark-text transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Bookings
        </button>

        <div className="flex items-center gap-3">
          <StatusBadge status={booking.status} />
          <Button
            variant="ghost"
            size="sm"
            icon={<Wallet size={14} />}
            onClick={() => setShowAdjust(true)}
            className="text-brand-purple"
          >
            Adjust Coins
          </Button>
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              icon={<XCircle size={14} />}
              onClick={() => setShowCancel(true)}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </motion.div>

      {/* Page title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-xl font-bold text-light-text dark:text-dark-text">
          {booking.pickupCity} → {booking.dropCity}
        </h1>
        <p className="text-sm text-light-text-3 dark:text-dark-text-3 mt-0.5 font-mono">
          #{booking.id.slice(-12).toUpperCase()}
        </p>
      </motion.div>

      {/* Detail card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
      >
        <BookingDetailCard booking={booking} />
      </motion.div>

      {/* Modals */}
      <CancelBookingModal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancelConfirm}
        booking={booking}
        loading={cancelling}
      />

      <ManualAdjustModal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
        prefillUserId={booking.postedBy?.id}
        prefillUserName={booking.postedBy?.name}
      />
    </div>
  );
}
