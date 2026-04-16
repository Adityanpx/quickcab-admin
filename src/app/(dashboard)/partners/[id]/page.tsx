"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  Wallet,
  Calendar,
  ShieldOff,
  ShieldBan,
  ShieldCheck,
  Copy,
} from "lucide-react";
import {
  usePartner,
  useSuspendPartner,
  useApproveKyc,
  useRejectKyc,
} from "@/lib/hooks/usePartners";
import { partnersApi } from "@/lib/api/partners";
import { KycDocViewer, KycActionBar } from "@/components/partners/KycDocViewer";
import { SuspendModal } from "@/components/partners/SuspendModal";
import { BlockModal } from "@/components/partners/BlockModal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import { formatDate, formatRelative, formatCurrency, cn } from "@/lib/utils";
import type { SuspendPartnerPayload } from "@/types/partner";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

type Tab = "overview" | "kyc" | "bookings" | "wallet";

const TAB_LIST: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "kyc", label: "KYC Documents" },
  { key: "bookings", label: "Booking History" },
  { key: "wallet", label: "Wallet History" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const partnerId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showSuspend, setShowSuspend] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [rejectNoteOpen, setRejectNoteOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const { data: partner, isLoading, isError } = usePartner(partnerId);
  const suspendMutation = useSuspendPartner();
  const approveKycMutation = useApproveKyc();
  const rejectKycMutation = useRejectKyc();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !partner) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-light-text-2 dark:text-dark-text-2">Partner not found</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const kycDocs = [
    { label: "Aadhaar Front", url: partner.kycRecord?.aadhaarFront ?? null },
    { label: "Aadhaar Back", url: partner.kycRecord?.aadhaarBack ?? null },
    { label: "Driving License", url: partner.kycRecord?.drivingLicenseUrl ?? null },
    { label: "Selfie", url: partner.kycRecord?.selfieUrl ?? null },
  ];

  const handleSuspend = async (data: SuspendPartnerPayload) => {
    await suspendMutation.mutateAsync({ id: partner.id, payload: data });
    setShowSuspend(false);
  };

  const handleBlock = async (reason: string) => {
    try {
      await partnersApi.block(partner.id, reason);
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner blocked permanently");
      setShowBlock(false);
    } catch {
      toast.error("Failed to block partner");
    }
  };

  const handleUnsuspend = async () => {
    try {
      await partnersApi.unsuspend(partner.id);
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner unsuspended");
    } catch {
      toast.error("Failed to unsuspend");
    }
  };

  const handleApproveKyc = async () => {
    await approveKycMutation.mutateAsync({ userId: partner.id });
  };

  const handleRejectKyc = async () => {
    if (!rejectNote.trim()) return;
    await rejectKycMutation.mutateAsync({ userId: partner.id, note: rejectNote });
    setRejectNoteOpen(false);
    setRejectNote("");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const isSuspended = partner.status === "SUSPENDED";
  const isBlocked = partner.status === "BLOCKED";

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Back + Actions header ───────────────────── */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-light-text-2 dark:text-dark-text-2 hover:text-light-text dark:hover:text-dark-text transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Partners
        </button>

        {/* Action buttons */}
        {!isBlocked && (
          <div className="flex items-center gap-2">
            {isSuspended ? (
              <Button
                variant="success"
                size="sm"
                icon={<ShieldCheck size={14} />}
                onClick={handleUnsuspend}
              >
                Unsuspend
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={<ShieldOff size={14} />}
                onClick={() => setShowSuspend(true)}
                className="text-brand-orange hover:text-brand-orange"
              >
                Suspend
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              icon={<ShieldBan size={14} />}
              onClick={() => setShowBlock(true)}
            >
              Block
            </Button>
          </div>
        )}
      </motion.div>

      {/* ── Profile Card ─────────────────────────────── */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="card"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <Avatar name={partner.name} size="lg" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
                {partner.name}
              </h2>
              <StatusBadge status={partner.status} />
              {partner.partnerProfile && (
                <Badge
                  variant={
                    partner.partnerProfile.subType === "VEHICLE_OWNER"
                      ? "partner"
                      : "vendor"
                  }
                >
                  {partner.partnerProfile.subType === "VEHICLE_OWNER"
                    ? "Vehicle Owner"
                    : "Vendor"}
                </Badge>
              )}
            </div>

            {/* Contact details */}
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => copyToClipboard(partner.mobile, "Mobile")}
                className="flex items-center gap-1.5 text-[13px] text-light-text-2 dark:text-dark-text-2 hover:text-brand-purple transition-colors group"
              >
                <Phone size={13} />
                {partner.mobile}
                <Copy size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
              {partner.email && (
                <button
                  onClick={() => copyToClipboard(partner.email!, "Email")}
                  className="flex items-center gap-1.5 text-[13px] text-light-text-2 dark:text-dark-text-2 hover:text-brand-purple transition-colors group"
                >
                  <Mail size={13} />
                  {partner.email}
                  <Copy size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              )}
              {(partner.partnerProfile?.areasOfInterest?.length ?? 0) > 0 && (
                <span className="flex items-center gap-1.5 text-[13px] text-light-text-2 dark:text-dark-text-2">
                  <MapPin size={13} />
                  {partner.partnerProfile?.areasOfInterest?.length} areas
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-[12px] text-light-text-3 dark:text-dark-text-3">
                <Calendar size={12} />
                Joined {formatDate(partner.createdAt)}
              </span>
              {partner.lastLoginAt && (
                <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                  Last active {formatRelative(partner.lastLoginAt)}
                </span>
              )}
              <span className="flex items-center gap-1 text-[12px] text-light-text-3 dark:text-dark-text-3">
                Referral:{" "}
                <button
                  onClick={() => copyToClipboard(partner.referralCode, "Referral code")}
                  className="font-mono font-medium text-brand-purple hover:underline"
                >
                  {partner.referralCode}
                </button>
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 shrink-0">
            <div className="text-center">
              <p className="text-xl font-bold text-light-text dark:text-dark-text">
                {partner.partnerProfile?.rating?.toFixed(1) ?? "—"}
              </p>
              <div className="flex items-center gap-1 justify-center">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                  ({partner.partnerProfile?.totalRatings ?? 0})
                </span>
              </div>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-light-text dark:text-dark-text">
                {formatCurrency(partner.walletBalance)}
              </p>
              <div className="flex items-center gap-1 justify-center">
                <Wallet size={12} className="text-brand-purple" />
              </div>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">Wallet</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ─────────────────────────────────────── */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-light-border dark:border-dark-border mb-5">
          {TAB_LIST.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors duration-150",
                activeTab === key
                  ? "text-brand-purple"
                  : "text-light-text-2 dark:text-dark-text-2 hover:text-light-text dark:hover:text-dark-text"
              )}
            >
              {label}
              {activeTab === key && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── Overview Tab ──────────────────────────── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Subscription status */}
              <div className="card">
                <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-4">
                  Subscription
                </h3>
                {partner.subscription ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-light-text-2 dark:text-dark-text-2">Plan</span>
                      <span className="font-medium text-light-text dark:text-dark-text">
                        {partner.subscription.plan.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-light-text-2 dark:text-dark-text-2">Status</span>
                      <StatusBadge status={partner.subscription.status} />
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-light-text-2 dark:text-dark-text-2">Expires</span>
                      <span className="text-light-text dark:text-dark-text">
                        {formatDate(partner.subscription.endDate)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-light-text-3 dark:text-dark-text-3">
                    No active subscription
                  </p>
                )}
              </div>

              {/* KYC status summary */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text">
                    KYC Status
                  </h3>
                  {partner.kycRecord && (
                    <StatusBadge status={partner.kycRecord.status} />
                  )}
                </div>
                {partner.kycRecord ? (
                  <div className="space-y-2">
                    {partner.kycRecord.aadhaarNumber && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-light-text-2 dark:text-dark-text-2">Aadhaar</span>
                        <span className="font-mono text-light-text dark:text-dark-text">
                          XXXX XXXX {partner.kycRecord.aadhaarNumber.slice(-4)}
                        </span>
                      </div>
                    )}
                    {partner.kycRecord.submittedAt && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-light-text-2 dark:text-dark-text-2">Submitted</span>
                        <span className="text-light-text dark:text-dark-text">
                          {formatDate(partner.kycRecord.submittedAt)}
                        </span>
                      </div>
                    )}
                    {partner.kycRecord.adminNote && (
                      <div className="pt-2 mt-2 border-t border-light-border dark:border-dark-border">
                        <p className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                          Admin note:
                        </p>
                        <p className="text-[13px] text-light-text dark:text-dark-text mt-1">
                          {partner.kycRecord.adminNote}
                        </p>
                      </div>
                    )}
                    <div className="pt-3">
                      <KycActionBar
                        kycStatus={partner.kycRecord.status}
                        onApprove={handleApproveKyc}
                        onReject={() => setRejectNoteOpen(true)}
                        loading={approveKycMutation.isPending || rejectKycMutation.isPending}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-light-text-3 dark:text-dark-text-3">
                    No KYC record found
                  </p>
                )}
              </div>

              {/* Areas of interest */}
              {partner.partnerProfile && (partner.partnerProfile.areasOfInterest?.length ?? 0) > 0 && (
                <div className="card lg:col-span-2">
                  <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
                    Areas of Interest
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.partnerProfile.areasOfInterest.map((area) => (
                      <span
                        key={area}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-brand-purple-muted dark:bg-brand-purple-muted-dark text-brand-purple"
                      >
                        <MapPin size={11} />
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── KYC Tab ───────────────────────────────── */}
          {activeTab === "kyc" && (
            <div className="space-y-4">
              {partner.kycRecord ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-light-text-2 dark:text-dark-text-2">
                      Review all uploaded documents below
                    </p>
                    <KycActionBar
                      kycStatus={partner.kycRecord.status}
                      onApprove={handleApproveKyc}
                      onReject={() => setRejectNoteOpen(true)}
                      loading={approveKycMutation.isPending || rejectKycMutation.isPending}
                    />
                  </div>
                  <KycDocViewer docs={kycDocs} />
                </>
              ) : (
                <div className="card text-center py-12">
                  <p className="text-light-text-2 dark:text-dark-text-2">
                    No KYC documents submitted yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Bookings Tab ──────────────────────────── */}
          {activeTab === "bookings" && (
            <div className="card">
              <p className="text-[13px] text-light-text-2 dark:text-dark-text-2 py-8 text-center">
                Booking history will be available once bookings API is integrated.
              </p>
            </div>
          )}

          {/* ── Wallet Tab ────────────────────────────── */}
          {activeTab === "wallet" && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text">
                  Wallet Balance
                </h3>
                <span className="text-xl font-bold text-brand-purple">
                  {formatCurrency(partner.walletBalance)}
                </span>
              </div>
              <p className="text-[13px] text-light-text-2 dark:text-dark-text-2 text-center py-6">
                Transaction history will be displayed here.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Modals ──────────────────────────────────── */}
      <SuspendModal
        isOpen={showSuspend}
        onClose={() => setShowSuspend(false)}
        onConfirm={handleSuspend}
        partner={partner}
        loading={suspendMutation.isPending}
      />

      <BlockModal
        isOpen={showBlock}
        onClose={() => setShowBlock(false)}
        onConfirm={handleBlock}
        partner={partner}
      />

      {/* KYC Reject Note Modal */}
      <Modal
        isOpen={rejectNoteOpen}
        onClose={() => setRejectNoteOpen(false)}
        title="Reject KYC — Add Note"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectNoteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRejectKyc}
              loading={rejectKycMutation.isPending}
              className="!bg-brand-red !text-white"
            >
              Reject KYC
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-light-text-2 dark:text-dark-text-2">
            This note will be sent to the partner explaining why their KYC was rejected.
          </p>
          <textarea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="e.g. Aadhaar image is blurry, please re-upload..."
            className="input-base resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}
