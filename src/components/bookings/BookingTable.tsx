"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, XCircle, ArrowRight } from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/booking";

const VEHICLE_LABELS: Record<string, string> = {
  SEDAN: "Sedan",
  SUV: "SUV",
  HATCHBACK: "Hatchback",
  TEMPO_TRAVELLER: "Tempo",
  BUS: "Bus",
  LUXURY: "Luxury",
};

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onCancel: (booking: Booking) => void;
}

export function BookingTable({
  bookings,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onCancel,
}: BookingTableProps) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="pl-5">Route</th>
              <th>Partner A</th>
              <th>Partner B</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Fare</th>
              <th>Status</th>
              <th className="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={8} />
              ))
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No bookings found"
                    description="Try adjusting your filters or date range"
                  />
                </td>
              </tr>
            ) : (
              bookings.map((booking, i) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.25 }}
                >
                  {/* Route */}
                  <td className="pl-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-medium text-light-text dark:text-dark-text">
                        {booking.pickupCity}
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-light-text-3 dark:text-dark-text-3 shrink-0"
                      />
                      <span className="text-[13px] font-medium text-light-text dark:text-dark-text">
                        {booking.dropCity}
                      </span>
                    </div>
                    <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 font-mono mt-0.5">
                      #{booking.id.slice(-8).toUpperCase()}
                    </p>
                  </td>

                  {/* Partner A (poster) */}
                  <td>
                    {booking.postedBy ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={booking.postedBy.name} size="xs" />
                        <div>
                          <Link
                            href={`/partners/${booking.postedBy.id}`}
                            className="text-[12px] font-medium text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                          >
                            {booking.postedBy.name}
                          </Link>
                          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                            {booking.postedBy.mobile}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">—</span>
                    )}
                  </td>

                  {/* Partner B (acceptor) */}
                  <td>
                    {booking.acceptedBy ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={booking.acceptedBy.name} size="xs" />
                        <div>
                          <Link
                            href={`/partners/${booking.acceptedBy.id}`}
                            className="text-[12px] font-medium text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                          >
                            {booking.acceptedBy.name}
                          </Link>
                          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                            {booking.acceptedBy.mobile}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                        Not accepted
                      </span>
                    )}
                  </td>

                  {/* Vehicle type */}
                  <td>
                    <Badge variant="gray">
                      {VEHICLE_LABELS[booking.vehicleType] ?? booking.vehicleType}
                    </Badge>
                  </td>

                  {/* Date */}
                  <td>
                    <p className="text-[12px] text-light-text dark:text-dark-text">
                      {formatDate(booking.date)}
                    </p>
                    <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                      {booking.time}
                    </p>
                  </td>

                  {/* Fare */}
                  <td>
                    <p className="text-[13px] font-semibold text-light-text dark:text-dark-text">
                      {formatCurrency(booking.postedAmount)}
                    </p>
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>

                  {/* Actions */}
                  <td className="pr-5">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="ghost" size="xs" icon={<Eye size={13} />}>
                          View
                        </Button>
                      </Link>
                      {booking.status === "OPEN" ? (
                        <Button
                          variant="danger"
                          size="xs"
                          icon={<XCircle size={13} />}
                          onClick={() => onCancel(booking)}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && bookings.length > 0 && (
        <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
