"use client";

import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/booking";

const VEHICLE_LABELS: Record<string, string> = {
  SEDAN: "Sedan",
  SUV: "SUV",
  HATCHBACK: "Hatchback",
  TEMPO_TRAVELLER: "Tempo Traveller",
  BUS: "Bus",
  LUXURY: "Luxury",
};

interface BookingDetailCardProps {
  booking: Booking;
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-light-border dark:border-dark-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-light-surface-2 dark:bg-dark-surface flex items-center justify-center text-light-text-2 dark:text-dark-text-2 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mb-0.5">
          {label}
        </p>
        <div
          className={
            mono
              ? "font-mono text-[13px] text-light-text dark:text-dark-text"
              : "text-[14px] font-medium text-light-text dark:text-dark-text"
          }
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function BookingDetailCard({ booking }: BookingDetailCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Left: Trip Details ─────────────────── */}
      <div className="lg:col-span-2 space-y-4">
        {/* Route card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text">
              Trip Details
            </h3>
            <StatusBadge status={booking.status} />
          </div>

          {/* Route visual */}
          <div className="flex items-center gap-3 mb-5 px-3 py-4 rounded-xl bg-light-surface-2 dark:bg-dark-surface">
            <div className="text-center min-w-0 flex-1">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-purple mx-auto mb-2" />
              <p className="font-bold text-[15px] text-light-text dark:text-dark-text truncate">
                {booking.pickupCity}
              </p>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
                Pickup
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-8 h-px bg-light-border dark:bg-dark-border" />
              <ArrowRight size={14} className="text-light-text-3 dark:text-dark-text-3" />
              <div className="w-8 h-px bg-light-border dark:bg-dark-border" />
            </div>
            <div className="text-center min-w-0 flex-1">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green mx-auto mb-2" />
              <p className="font-bold text-[15px] text-light-text dark:text-dark-text truncate">
                {booking.dropCity}
              </p>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
                Drop
              </p>
            </div>
          </div>

          <div className="space-y-0">
            <InfoRow
              icon={<Calendar size={14} />}
              label="Date & Time"
              value={`${formatDate(booking.date)} at ${booking.time}`}
            />
            <InfoRow
              icon={<Car size={14} />}
              label="Vehicle Type"
              value={
                <Badge variant="gray">
                  {VEHICLE_LABELS[booking.vehicleType] ?? booking.vehicleType}
                </Badge>
              }
            />
            <InfoRow
              icon={<IndianRupee size={14} />}
              label="Posted Fare"
              value={formatCurrency(booking.postedAmount)}
            />
            {booking.originalFare && (
              <InfoRow
                icon={<IndianRupee size={14} />}
                label="Original Customer Fare"
                value={formatCurrency(booking.originalFare)}
              />
            )}
            <InfoRow
              icon={<MapPin size={14} />}
              label="Coins Awarded"
              value={
                booking.coinsAwarded ? (
                  <span className="text-brand-green text-[13px] font-medium">
                    ✓ Coins credited to Partner A
                  </span>
                ) : (
                  <span className="text-light-text-3 dark:text-dark-text-3 text-[13px]">
                    Not yet awarded
                  </span>
                )
              }
            />
            <InfoRow
              icon={<Clock size={14} />}
              label="Booking ID"
              value={booking.id}
              mono
            />
            <InfoRow
              icon={<Clock size={14} />}
              label="Posted At"
              value={formatDateTime(booking.createdAt)}
            />
          </div>
        </div>

        {/* Customer info (if present) */}
        {booking.customerName && (
          <div className="card">
            <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-4">
              Customer Details
            </h3>
            <div className="space-y-0">
              <InfoRow
                icon={<User size={14} />}
                label="Customer Name"
                value={booking.customerName}
              />
              {booking.customerMobile && (
                <InfoRow
                  icon={<Phone size={14} />}
                  label="Customer Mobile"
                  value={
                    <a
                      href={`tel:${booking.customerMobile}`}
                      className="text-brand-purple hover:underline"
                    >
                      {booking.customerMobile}
                    </a>
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Partners + Timeline ─────────── */}
      <div className="space-y-4">
        {/* Partner A */}
        <div className="card">
          <p className="text-[11px] font-semibold text-light-text-3 dark:text-dark-text-3 uppercase tracking-wider mb-3">
            Posted By (Partner A)
          </p>
          {booking.postedBy ? (
            <div className="flex items-center gap-3">
              <Avatar name={booking.postedBy.name} size="md" />
              <div className="min-w-0">
                <Link
                  href={`/partners/${booking.postedBy.id}`}
                  className="text-[14px] font-semibold text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                >
                  {booking.postedBy.name}
                </Link>
                <p className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                  {booking.postedBy.mobile}
                </p>
                {booking.postedBy.partnerProfile && (
                  <Badge
                    variant={
                      booking.postedBy.partnerProfile.subType === "VEHICLE_OWNER"
                        ? "partner"
                        : "vendor"
                    }
                    className="mt-1.5"
                  >
                    {booking.postedBy.partnerProfile.subType === "VEHICLE_OWNER"
                      ? "Vehicle Owner"
                      : "Vendor"}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-light-text-3 dark:text-dark-text-3">Unknown</p>
          )}
        </div>

        {/* Partner B */}
        <div className="card">
          <p className="text-[11px] font-semibold text-light-text-3 dark:text-dark-text-3 uppercase tracking-wider mb-3">
            Accepted By (Partner B)
          </p>
          {booking.acceptedBy ? (
            <div className="flex items-center gap-3">
              <Avatar name={booking.acceptedBy.name} size="md" />
              <div className="min-w-0">
                <Link
                  href={`/partners/${booking.acceptedBy.id}`}
                  className="text-[14px] font-semibold text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                >
                  {booking.acceptedBy.name}
                </Link>
                <p className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                  {booking.acceptedBy.mobile}
                </p>
                {booking.acceptedBy.partnerProfile && (
                  <Badge
                    variant={
                      booking.acceptedBy.partnerProfile.subType === "VEHICLE_OWNER"
                        ? "partner"
                        : "vendor"
                    }
                    className="mt-1.5"
                  >
                    {booking.acceptedBy.partnerProfile.subType === "VEHICLE_OWNER"
                      ? "Vehicle Owner"
                      : "Vendor"}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center mb-2">
                <User size={16} className="text-light-text-3 dark:text-dark-text-3" />
              </div>
              <p className="text-[13px] text-light-text-3 dark:text-dark-text-3">
                No partner accepted yet
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card">
          <p className="text-[11px] font-semibold text-light-text-3 dark:text-dark-text-3 uppercase tracking-wider mb-3">
            Timeline
          </p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-brand-purple mt-1 shrink-0" />
                <div className="w-px flex-1 bg-light-border dark:bg-dark-border mt-1" />
              </div>
              <div className="pb-3">
                <p className="text-[12px] font-medium text-light-text dark:text-dark-text">
                  Posted
                </p>
                <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                  {formatDateTime(booking.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    booking.acceptedBy
                      ? "bg-brand-green"
                      : "bg-light-border dark:bg-dark-border"
                  }`}
                />
              </div>
              <div>
                <p className="text-[12px] font-medium text-light-text dark:text-dark-text">
                  {booking.acceptedBy ? "Accepted & Confirmed" : "Waiting for acceptance"}
                </p>
                <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                  {booking.acceptedBy
                    ? formatDateTime(booking.updatedAt)
                    : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
